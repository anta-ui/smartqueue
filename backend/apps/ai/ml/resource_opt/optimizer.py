import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from sklearn.ensemble import RandomForestRegressor
import optuna

from apps.ai.models import MLModel, ResourceOptimization
from apps.queues.models import ServicePoint, Queue


class ResourceOptimizer:
    """Optimiseur de ressources utilisant l'apprentissage automatique"""

    def __init__(self, service_point_id: str):
        self.service_point_id = service_point_id
        self.model = None
        self.load_model()

    def load_model(self):
        """Charge ou crée le modèle d'optimisation"""
        try:
            self.model = MLModel.objects.get(
                type='resource_opt',
                name='random_forest',
                status='active'
            )
        except MLModel.DoesNotExist:
            # Le modèle sera créé lors du premier entraînement
            pass

    def generate_suggestions(self) -> Dict:
        """Génère des suggestions d'optimisation des ressources"""
        service_point = ServicePoint.objects.get(id=self.service_point_id)
        current_metrics = self._get_current_metrics(service_point)
        
        # Prédiction de la charge future
        future_load = self._predict_future_load(
            service_point,
            current_metrics
        )
        
        # Optimisation des ressources
        suggestions = self._optimize_resources(
            service_point,
            current_metrics,
            future_load
        )
        
        # Enregistrement des suggestions
        optimization = ResourceOptimization.objects.create(
            service_point=service_point,
            model=self.model,
            current_load=current_metrics['current_load'],
            suggested_action=suggestions['action'],
            priority=suggestions['priority'],
            expected_impact=suggestions['impact']
        )
        
        return {
            'optimization_id': optimization.id,
            'current_load': current_metrics['current_load'],
            'suggested_action': suggestions['action'],
            'priority': suggestions['priority'],
            'expected_impact': suggestions['impact'],
            'reasoning': suggestions['reasoning']
        }

    def _get_current_metrics(self, service_point: ServicePoint) -> Dict:
        """Récupère les métriques actuelles du point de service"""
        now = datetime.now()
        last_hour = now - timedelta(hours=1)
        
        metrics = {
            # Charge actuelle
            'current_load': service_point.get_current_load(),
            
            # Métriques de performance
            'avg_service_time': service_point.get_average_service_time(
                time_window=timedelta(hours=1)
            ),
            'efficiency_score': service_point.get_efficiency_score(
                time_window=timedelta(hours=1)
            ),
            
            # Files associées
            'queue_lengths': [
                queue.get_current_length()
                for queue in service_point.queues.all()
            ],
            'wait_times': [
                queue.get_average_wait_time(time_window=timedelta(hours=1))
                for queue in service_point.queues.all()
            ],
            
            # Contexte temporel
            'hour': now.hour,
            'day_of_week': now.weekday(),
            'is_peak_time': self._is_peak_time(now),
        }
        
        return metrics

    def _predict_future_load(
        self,
        service_point: ServicePoint,
        current_metrics: Dict
    ) -> Dict:
        """Prédit la charge future du point de service"""
        # Utilise RandomForest pour prédire la charge
        predictions = {
            'next_hour': self._predict_load(
                service_point,
                current_metrics,
                horizon=1
            ),
            'next_4_hours': self._predict_load(
                service_point,
                current_metrics,
                horizon=4
            ),
        }
        
        # Analyse des tendances
        trends = {
            'load_trend': self._calculate_trend(
                service_point.get_historical_loads(
                    time_window=timedelta(hours=4)
                )
            ),
            'efficiency_trend': self._calculate_trend(
                service_point.get_historical_efficiency(
                    time_window=timedelta(hours=4)
                )
            ),
        }
        
        return {
            'predictions': predictions,
            'trends': trends
        }

    def _optimize_resources(
        self,
        service_point: ServicePoint,
        current_metrics: Dict,
        future_load: Dict
    ) -> Dict:
        """Optimise l'allocation des ressources"""
        def objective(trial):
            # Paramètres à optimiser
            num_resources = trial.suggest_int(
                'num_resources',
                max(1, service_point.min_resources),
                service_point.max_resources
            )
            
            # Simulation avec ces paramètres
            metrics = self._simulate_performance(
                service_point,
                num_resources,
                future_load
            )
            
            # Fonction objectif : équilibre entre efficacité et coût
            score = (
                0.6 * metrics['efficiency'] +
                0.3 * metrics['wait_time_reduction'] +
                0.1 * metrics['cost_efficiency']
            )
            
            return score
        
        # Optimisation avec Optuna
        study = optuna.create_study(direction='maximize')
        study.optimize(objective, n_trials=50)
        
        # Analyse des résultats
        best_params = study.best_params
        current_resources = service_point.get_active_resources_count()
        
        # Détermination de l'action
        if best_params['num_resources'] > current_resources:
            action = 'add'
            diff = best_params['num_resources'] - current_resources
        elif best_params['num_resources'] < current_resources:
            action = 'remove'
            diff = current_resources - best_params['num_resources']
        else:
            action = 'maintain'
            diff = 0
        
        # Calcul de l'impact attendu
        impact = self._calculate_impact(
            service_point,
            best_params['num_resources'],
            future_load
        )
        
        # Détermination de la priorité
        priority = self._determine_priority(
            current_metrics,
            future_load,
            impact
        )
        
        return {
            'action': action,
            'priority': priority,
            'impact': impact,
            'reasoning': self._generate_reasoning(
                action,
                diff,
                impact,
                future_load
            )
        }

    def _predict_load(
        self,
        service_point: ServicePoint,
        current_metrics: Dict,
        horizon: int
    ) -> float:
        """Prédit la charge pour un horizon donné"""
        # À implémenter avec le modèle RandomForest
        return 0.75  # Exemple

    def _calculate_trend(self, data: List[float]) -> float:
        """Calcule la tendance d'une série de données"""
        if not data:
            return 0
        x = np.arange(len(data))
        y = np.array(data)
        z = np.polyfit(x, y, 1)
        return z[0]

    def _is_peak_time(self, time: datetime) -> bool:
        """Détermine si c'est une période de pointe"""
        hour = time.hour
        return (
            (9 <= hour <= 11) or  # Pic du matin
            (14 <= hour <= 16)    # Pic de l'après-midi
        )

    def _simulate_performance(
        self,
        service_point: ServicePoint,
        num_resources: int,
        future_load: Dict
    ) -> Dict:
        """Simule la performance avec un nombre donné de ressources"""
        # Simulation simplifiée
        base_efficiency = 0.8
        base_wait_time = 10  # minutes
        
        # Ajustements basés sur le ratio charge/ressources
        load_ratio = future_load['predictions']['next_hour'] / num_resources
        
        efficiency = base_efficiency * (1 / (1 + np.exp(load_ratio - 1)))
        wait_time = base_wait_time * load_ratio
        
        # Coût par ressource
        cost_per_resource = 100  # unité arbitraire
        total_cost = num_resources * cost_per_resource
        
        return {
            'efficiency': efficiency,
            'wait_time_reduction': 1 / (1 + wait_time),
            'cost_efficiency': 1 / (1 + total_cost/1000)
        }

    def _calculate_impact(
        self,
        service_point: ServicePoint,
        num_resources: int,
        future_load: Dict
    ) -> Dict:
        """Calcule l'impact attendu des changements de ressources"""
        current_performance = self._simulate_performance(
            service_point,
            service_point.get_active_resources_count(),
            future_load
        )
        
        new_performance = self._simulate_performance(
            service_point,
            num_resources,
            future_load
        )
        
        return {
            'efficiency_change': (
                new_performance['efficiency'] -
                current_performance['efficiency']
            ),
            'wait_time_impact': (
                new_performance['wait_time_reduction'] -
                current_performance['wait_time_reduction']
            ),
            'cost_impact': (
                new_performance['cost_efficiency'] -
                current_performance['cost_efficiency']
            )
        }

    def _determine_priority(
        self,
        current_metrics: Dict,
        future_load: Dict,
        impact: Dict
    ) -> str:
        """Détermine la priorité de la suggestion"""
        # Facteurs de priorité
        factors = {
            'load_severity': (
                future_load['predictions']['next_hour'] /
                current_metrics['current_load']
            ),
            'efficiency_impact': abs(impact['efficiency_change']),
            'wait_time_impact': abs(impact['wait_time_impact']),
        }
        
        # Score composite
        priority_score = (
            0.4 * factors['load_severity'] +
            0.3 * factors['efficiency_impact'] +
            0.3 * factors['wait_time_impact']
        )
        
        # Seuils de priorité
        if priority_score > 0.7:
            return 'high'
        elif priority_score > 0.4:
            return 'medium'
        else:
            return 'low'

    def _generate_reasoning(
        self,
        action: str,
        diff: int,
        impact: Dict,
        future_load: Dict
    ) -> str:
        """Génère une explication pour la suggestion"""
        if action == 'add':
            reason = (
                f"Suggestion d'ajouter {diff} ressource(s) basée sur:\n"
                f"- Charge prévue: {future_load['predictions']['next_hour']:.1%}\n"
                f"- Impact sur l'efficacité: {impact['efficiency_change']:.1%}\n"
                f"- Impact sur le temps d'attente: {impact['wait_time_impact']:.1%}"
            )
        elif action == 'remove':
            reason = (
                f"Suggestion de retirer {diff} ressource(s) basée sur:\n"
                f"- Baisse de charge prévue: {future_load['predictions']['next_hour']:.1%}\n"
                f"- Optimisation des coûts: {impact['cost_impact']:.1%}\n"
                f"- Impact minimal sur le service: {impact['efficiency_change']:.1%}"
            )
        else:
            reason = (
                "Maintien du niveau actuel des ressources:\n"
                f"- Charge stable: {future_load['predictions']['next_hour']:.1%}\n"
                "- Performance optimale avec la configuration actuelle"
            )
        
        return reason
