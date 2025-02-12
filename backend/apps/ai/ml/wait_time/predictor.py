import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from prophet import Prophet

from apps.ai.models import MLModel, WaitTimePrediction
from apps.queues.models import Queue


class WaitTimePredictor:
    """Prédicteur hybride combinant plusieurs modèles pour une meilleure précision"""

    def __init__(self, queue_id: str):
        self.queue_id = queue_id
        self.gb_model = None
        self.prophet_model = None
        self.scaler = StandardScaler()
        self.feature_importance = {}
        self.load_models()

    def load_models(self):
        """Charge ou crée les modèles nécessaires"""
        try:
            self.gb_model = MLModel.objects.get(
                type='wait_time',
                name='gradient_boosting',
                status='active'
            )
            self.prophet_model = MLModel.objects.get(
                type='wait_time',
                name='prophet',
                status='active'
            )
        except MLModel.DoesNotExist:
            # Les modèles seront créés lors du premier entraînement
            pass

    def prepare_features(self, queue: Queue) -> Tuple[np.ndarray, List[str]]:
        """Prépare les features pour la prédiction"""
        now = datetime.now()
        
        # Features temporelles
        features = {
            'hour': now.hour,
            'day_of_week': now.weekday(),
            'is_weekend': 1 if now.weekday() >= 5 else 0,
            'is_holiday': self._check_if_holiday(now),
            
            # Features de la file
            'current_length': queue.get_current_length(),
            'avg_service_time': queue.get_average_service_time(),
            'num_service_points': queue.service_points.filter(
                status='active'
            ).count(),
            
            # Métriques historiques
            'avg_wait_last_hour': queue.get_average_wait_time(
                time_window=timedelta(hours=1)
            ),
            'abandonment_rate': queue.get_abandonment_rate(
                time_window=timedelta(days=1)
            ),
        }
        
        # Ajouter les tendances récentes
        historical_data = queue.get_historical_metrics(
            time_window=timedelta(hours=24)
        )
        if historical_data:
            features.update({
                'trend_wait_time': self._calculate_trend(
                    historical_data['wait_times']
                ),
                'trend_arrivals': self._calculate_trend(
                    historical_data['arrival_rates']
                ),
            })
        
        feature_names = list(features.keys())
        feature_values = np.array([list(features.values())])
        
        return self.scaler.fit_transform(feature_values), feature_names

    def predict(self, queue: Queue) -> Dict:
        """Génère une prédiction du temps d'attente"""
        features, feature_names = self.prepare_features(queue)
        
        # Prédiction avec GradientBoosting
        gb_prediction = self.gb_model.predict(features)[0]
        
        # Prédiction avec Prophet
        prophet_prediction = self._get_prophet_prediction(queue)
        
        # Combinaison des prédictions avec pondération
        final_prediction = (0.7 * gb_prediction + 0.3 * prophet_prediction)
        
        # Calcul de la confiance
        confidence = self._calculate_confidence(
            gb_prediction,
            prophet_prediction,
            queue
        )
        
        # Identification des facteurs d'influence
        factors = self._identify_influence_factors(
            features,
            feature_names,
            final_prediction
        )
        
        # Enregistrement de la prédiction
        prediction = WaitTimePrediction.objects.create(
            queue=queue,
            model=self.gb_model,
            predicted_wait_time=int(final_prediction),
            confidence=confidence,
            features_used=dict(zip(feature_names, features.flatten().tolist())),
            prediction_factors=factors
        )
        
        return {
            'estimated_wait_time': int(final_prediction),
            'confidence': confidence,
            'factors': factors,
            'prediction_id': prediction.id
        }

    def _calculate_trend(self, data: List[float]) -> float:
        """Calcule la tendance d'une série de données"""
        if not data:
            return 0
        x = np.arange(len(data))
        y = np.array(data)
        z = np.polyfit(x, y, 1)
        return z[0]  # retourne la pente

    def _check_if_holiday(self, date: datetime) -> int:
        """Vérifie si une date est un jour férié"""
        # À implémenter avec un calendrier de jours fériés
        return 0

    def _get_prophet_prediction(self, queue: Queue) -> float:
        """Obtient une prédiction via Prophet"""
        # À implémenter avec Facebook Prophet
        return 0

    def _calculate_confidence(
        self,
        gb_pred: float,
        prophet_pred: float,
        queue: Queue
    ) -> float:
        """Calcule le niveau de confiance de la prédiction"""
        # Différence entre les prédictions
        pred_diff = abs(gb_pred - prophet_pred) / max(gb_pred, prophet_pred)
        
        # Qualité des données historiques
        historical_quality = self._assess_historical_data_quality(queue)
        
        # Stabilité récente
        stability = self._assess_queue_stability(queue)
        
        # Combine les facteurs
        confidence = (
            0.4 * (1 - pred_diff) +  # accord entre les modèles
            0.3 * historical_quality +  # qualité des données
            0.3 * stability  # stabilité de la file
        )
        
        return max(0.0, min(1.0, confidence))

    def _identify_influence_factors(
        self,
        features: np.ndarray,
        feature_names: List[str],
        prediction: float
    ) -> List[Dict]:
        """Identifie les facteurs influençant la prédiction"""
        # Utilise SHAP ou une autre méthode d'explicabilité
        # Pour cet exemple, utilise une méthode simplifiée
        factors = []
        feature_impacts = self.gb_model.feature_importances_
        
        for name, impact in zip(feature_names, feature_impacts):
            if impact > 0.1:  # seuil arbitraire
                factors.append({
                    'factor': name,
                    'impact': float(impact)
                })
        
        return sorted(factors, key=lambda x: abs(x['impact']), reverse=True)[:3]

    def _assess_historical_data_quality(self, queue: Queue) -> float:
        """Évalue la qualité des données historiques"""
        # À implémenter : vérification de la complétude et cohérence
        return 0.8

    def _assess_queue_stability(self, queue: Queue) -> float:
        """Évalue la stabilité récente de la file"""
        # À implémenter : analyse de la variance récente
        return 0.7
