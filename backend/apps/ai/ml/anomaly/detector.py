import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pandas as pd

from apps.ai.models import MLModel, QueueAnomaly
from apps.queues.models import Queue


class AnomalyDetector:
    """Détecteur d'anomalies dans les files d'attente utilisant plusieurs approches"""

    def __init__(self, queue_id: str):
        self.queue_id = queue_id
        self.isolation_forest = None
        self.scaler = StandardScaler()
        self.load_models()

    def load_models(self):
        """Charge ou crée les modèles de détection"""
        try:
            self.isolation_forest = MLModel.objects.get(
                type='anomaly',
                name='isolation_forest',
                status='active'
            )
        except MLModel.DoesNotExist:
            # Le modèle sera créé lors du premier entraînement
            pass

    def detect(self) -> List[Dict]:
        """Détecte les anomalies dans la file d'attente"""
        queue = Queue.objects.get(id=self.queue_id)
        current_metrics = self._get_current_metrics(queue)
        
        # Détection des anomalies
        anomalies = []
        
        # 1. Anomalies de temps d'attente
        wait_time_anomalies = self._detect_wait_time_anomalies(
            queue,
            current_metrics
        )
        anomalies.extend(wait_time_anomalies)
        
        # 2. Anomalies d'abandon
        abandonment_anomalies = self._detect_abandonment_anomalies(
            queue,
            current_metrics
        )
        anomalies.extend(abandonment_anomalies)
        
        # 3. Anomalies de temps de service
        service_time_anomalies = self._detect_service_time_anomalies(
            queue,
            current_metrics
        )
        anomalies.extend(service_time_anomalies)
        
        # 4. Anomalies de motifs
        pattern_anomalies = self._detect_pattern_anomalies(
            queue,
            current_metrics
        )
        anomalies.extend(pattern_anomalies)
        
        return anomalies

    def _get_current_metrics(self, queue: Queue) -> Dict:
        """Récupère les métriques actuelles de la file"""
        now = datetime.now()
        
        metrics = {
            # Métriques de base
            'current_length': queue.get_current_length(),
            'current_wait_time': queue.get_current_wait_time(),
            'current_service_time': queue.get_current_service_time(),
            
            # Métriques sur la dernière heure
            'avg_wait_time_1h': queue.get_average_wait_time(
                time_window=timedelta(hours=1)
            ),
            'avg_service_time_1h': queue.get_average_service_time(
                time_window=timedelta(hours=1)
            ),
            'abandonment_rate_1h': queue.get_abandonment_rate(
                time_window=timedelta(hours=1)
            ),
            
            # Métriques sur les dernières 24h
            'avg_wait_time_24h': queue.get_average_wait_time(
                time_window=timedelta(hours=24)
            ),
            'avg_service_time_24h': queue.get_average_service_time(
                time_window=timedelta(hours=24)
            ),
            'abandonment_rate_24h': queue.get_abandonment_rate(
                time_window=timedelta(hours=24)
            ),
            
            # Contexte temporel
            'hour': now.hour,
            'day_of_week': now.weekday(),
            'is_peak_time': self._is_peak_time(now),
        }
        
        # Tendances
        metrics.update(self._calculate_trends(queue))
        
        return metrics

    def _calculate_trends(self, queue: Queue) -> Dict:
        """Calcule les tendances des différentes métriques"""
        # Récupère les données historiques
        historical_data = queue.get_historical_metrics(
            time_window=timedelta(hours=24)
        )
        
        trends = {}
        metrics = [
            'wait_times',
            'service_times',
            'queue_lengths',
            'abandonment_rates'
        ]
        
        for metric in metrics:
            if metric in historical_data:
                trends[f'{metric}_trend'] = self._calculate_trend(
                    historical_data[metric]
                )
        
        return trends

    def _detect_wait_time_anomalies(
        self,
        queue: Queue,
        current_metrics: Dict
    ) -> List[Dict]:
        """Détecte les anomalies liées aux temps d'attente"""
        anomalies = []
        
        # 1. Comparaison avec les moyennes historiques
        wait_time_ratio = (
            current_metrics['current_wait_time'] /
            current_metrics['avg_wait_time_24h']
            if current_metrics['avg_wait_time_24h'] > 0 else 1
        )
        
        # Seuils d'anomalie
        thresholds = {
            'critical': 2.5,  # 150% au-dessus de la moyenne
            'high': 2.0,      # 100% au-dessus de la moyenne
            'medium': 1.5,    # 50% au-dessus de la moyenne
        }
        
        if wait_time_ratio > 1:
            # Détermine la sévérité
            severity = 'low'
            for level, threshold in thresholds.items():
                if wait_time_ratio >= threshold:
                    severity = level
                    break
            
            # Crée l'anomalie
            anomaly = QueueAnomaly.objects.create(
                queue=queue,
                model=self.isolation_forest,
                type='wait_time',
                severity=severity,
                metrics={
                    'current_wait_time': current_metrics['current_wait_time'],
                    'average_wait_time': current_metrics['avg_wait_time_24h'],
                    'ratio': wait_time_ratio,
                    'trend': current_metrics.get('wait_times_trend', 0)
                },
                description=(
                    f"Temps d'attente anormal détecté. "
                    f"Actuel: {current_metrics['current_wait_time']:.1f}min, "
                    f"Moyenne: {current_metrics['avg_wait_time_24h']:.1f}min "
                    f"(+{(wait_time_ratio-1)*100:.1f}%)"
                )
            )
            
            anomalies.append({
                'id': anomaly.id,
                'type': 'wait_time',
                'severity': severity,
                'metrics': anomaly.metrics,
                'description': anomaly.description
            })
        
        return anomalies

    def _detect_abandonment_anomalies(
        self,
        queue: Queue,
        current_metrics: Dict
    ) -> List[Dict]:
        """Détecte les anomalies liées aux taux d'abandon"""
        anomalies = []
        
        # Comparaison avec les moyennes historiques
        abandonment_ratio = (
            current_metrics['abandonment_rate_1h'] /
            current_metrics['abandonment_rate_24h']
            if current_metrics['abandonment_rate_24h'] > 0 else 1
        )
        
        # Seuils d'anomalie pour les taux d'abandon
        thresholds = {
            'critical': 3.0,  # 200% au-dessus de la moyenne
            'high': 2.5,      # 150% au-dessus de la moyenne
            'medium': 2.0,    # 100% au-dessus de la moyenne
        }
        
        if abandonment_ratio > 1:
            # Détermine la sévérité
            severity = 'low'
            for level, threshold in thresholds.items():
                if abandonment_ratio >= threshold:
                    severity = level
                    break
            
            # Crée l'anomalie
            anomaly = QueueAnomaly.objects.create(
                queue=queue,
                model=self.isolation_forest,
                type='abandonment',
                severity=severity,
                metrics={
                    'current_rate': current_metrics['abandonment_rate_1h'],
                    'average_rate': current_metrics['abandonment_rate_24h'],
                    'ratio': abandonment_ratio,
                    'trend': current_metrics.get('abandonment_rates_trend', 0)
                },
                description=(
                    f"Taux d'abandon anormal détecté. "
                    f"Actuel: {current_metrics['abandonment_rate_1h']:.1%}, "
                    f"Moyenne: {current_metrics['abandonment_rate_24h']:.1%} "
                    f"(+{(abandonment_ratio-1)*100:.1f}%)"
                )
            )
            
            anomalies.append({
                'id': anomaly.id,
                'type': 'abandonment',
                'severity': severity,
                'metrics': anomaly.metrics,
                'description': anomaly.description
            })
        
        return anomalies

    def _detect_service_time_anomalies(
        self,
        queue: Queue,
        current_metrics: Dict
    ) -> List[Dict]:
        """Détecte les anomalies liées aux temps de service"""
        anomalies = []
        
        # Comparaison avec les moyennes historiques
        service_time_ratio = (
            current_metrics['current_service_time'] /
            current_metrics['avg_service_time_24h']
            if current_metrics['avg_service_time_24h'] > 0 else 1
        )
        
        # Seuils d'anomalie pour les temps de service
        thresholds = {
            'critical': 2.0,  # 100% au-dessus de la moyenne
            'high': 1.75,     # 75% au-dessus de la moyenne
            'medium': 1.5,    # 50% au-dessus de la moyenne
        }
        
        if service_time_ratio > 1:
            # Détermine la sévérité
            severity = 'low'
            for level, threshold in thresholds.items():
                if service_time_ratio >= threshold:
                    severity = level
                    break
            
            # Crée l'anomalie
            anomaly = QueueAnomaly.objects.create(
                queue=queue,
                model=self.isolation_forest,
                type='service_time',
                severity=severity,
                metrics={
                    'current_time': current_metrics['current_service_time'],
                    'average_time': current_metrics['avg_service_time_24h'],
                    'ratio': service_time_ratio,
                    'trend': current_metrics.get('service_times_trend', 0)
                },
                description=(
                    f"Temps de service anormal détecté. "
                    f"Actuel: {current_metrics['current_service_time']:.1f}min, "
                    f"Moyenne: {current_metrics['avg_service_time_24h']:.1f}min "
                    f"(+{(service_time_ratio-1)*100:.1f}%)"
                )
            )
            
            anomalies.append({
                'id': anomaly.id,
                'type': 'service_time',
                'severity': severity,
                'metrics': anomaly.metrics,
                'description': anomaly.description
            })
        
        return anomalies

    def _detect_pattern_anomalies(
        self,
        queue: Queue,
        current_metrics: Dict
    ) -> List[Dict]:
        """Détecte les anomalies liées aux motifs"""
        # TODO: Implémenter la détection des anomalies de motifs
        return []

    def investigate(self, anomaly: QueueAnomaly) -> Dict:
        """Lance une investigation approfondie sur une anomalie"""
        queue = anomaly.queue
        
        # Met à jour le statut
        anomaly.status = 'investigating'
        anomaly.save()
        
        # Récupère le contexte étendu
        context = self._gather_investigation_context(queue, anomaly)
        
        # Analyse les causes possibles
        causes = self._analyze_potential_causes(anomaly, context)
        
        # Génère des recommandations
        recommendations = self._generate_recommendations(anomaly, causes, context)
        
        # Prépare le rapport d'investigation
        investigation = {
            'anomaly_id': anomaly.id,
            'context': context,
            'causes': causes,
            'recommendations': recommendations,
            'investigation_time': datetime.now().isoformat()
        }
        
        return investigation

    def _gather_investigation_context(
        self,
        queue: Queue,
        anomaly: QueueAnomaly
    ) -> Dict:
        """Rassemble le contexte étendu pour l'investigation"""
        # Période avant l'anomalie
        detection_time = anomaly.created_at
        context_window = timedelta(hours=4)
        
        context = {
            # Métriques historiques
            'historical_metrics': queue.get_historical_metrics(
                time_window=context_window,
                end_time=detection_time
            ),
            
            # État du service
            'service_points': [
                {
                    'id': sp.id,
                    'status': sp.status,
                    'efficiency': sp.get_efficiency_score(
                        time_window=context_window,
                        end_time=detection_time
                    ),
                    'load': sp.get_historical_loads(
                        time_window=context_window,
                        end_time=detection_time
                    )
                }
                for sp in queue.service_points.all()
            ],
            
            # Événements système
            'system_events': queue.get_system_events(
                time_window=context_window,
                end_time=detection_time
            ),
            
            # Autres anomalies
            'related_anomalies': list(
                QueueAnomaly.objects.filter(
                    queue=queue,
                    created_at__gte=detection_time - context_window,
                    created_at__lt=detection_time
                ).values()
            )
        }
        
        return context

    def _analyze_potential_causes(
        self,
        anomaly: QueueAnomaly,
        context: Dict
    ) -> List[Dict]:
        """Analyse les causes potentielles de l'anomalie"""
        causes = []
        
        if anomaly.type == 'wait_time':
            causes.extend(self._analyze_wait_time_causes(anomaly, context))
        elif anomaly.type == 'abandonment':
            causes.extend(self._analyze_abandonment_causes(anomaly, context))
        elif anomaly.type == 'service_time':
            causes.extend(self._analyze_service_time_causes(anomaly, context))
        elif anomaly.type == 'pattern':
            causes.extend(self._analyze_pattern_causes(anomaly, context))
        
        return sorted(
            causes,
            key=lambda x: x['probability'],
            reverse=True
        )

    def _analyze_wait_time_causes(
        self,
        anomaly: QueueAnomaly,
        context: Dict
    ) -> List[Dict]:
        """Analyse les causes des anomalies de temps d'attente"""
        causes = []
        metrics = context['historical_metrics']
        service_points = context['service_points']
        
        # Vérifie la charge des points de service
        total_load = sum(
            sp['load'][-1] if sp['load'] else 0
            for sp in service_points
        )
        if total_load > 0.8:  # Charge > 80%
            causes.append({
                'type': 'resource_shortage',
                'probability': 0.8,
                'description': (
                    "Charge élevée des points de service "
                    f"({total_load*100:.1f}%)"
                ),
                'metrics': {'load': total_load}
            })
        
        # Vérifie l'efficacité des points de service
        avg_efficiency = np.mean([
            sp['efficiency']
            for sp in service_points
            if sp['efficiency'] is not None
        ])
        if avg_efficiency < 0.7:  # Efficacité < 70%
            causes.append({
                'type': 'efficiency_drop',
                'probability': 0.7,
                'description': (
                    "Baisse d'efficacité des points de service "
                    f"({avg_efficiency*100:.1f}%)"
                ),
                'metrics': {'efficiency': avg_efficiency}
            })
        
        # Vérifie si c'est une période de pointe
        if self._is_peak_time(anomaly.created_at):
            causes.append({
                'type': 'peak_demand',
                'probability': 0.6,
                'description': "Période de forte affluence",
                'metrics': {'is_peak_time': True}
            })
        
        return causes

    def _analyze_abandonment_causes(
        self,
        anomaly: QueueAnomaly,
        context: Dict
    ) -> List[Dict]:
        """Analyse les causes des anomalies d'abandon"""
        causes = []
        metrics = context['historical_metrics']
        
        # Vérifie les temps d'attente
        wait_times = metrics.get('wait_times', [])
        if wait_times:
            avg_wait = np.mean(wait_times)
            if avg_wait > metrics.get('target_wait_time', 15) * 1.5:
                causes.append({
                    'type': 'long_wait_times',
                    'probability': 0.9,
                    'description': (
                        "Temps d'attente excessifs "
                        f"(moyenne: {avg_wait:.1f} min)"
                    ),
                    'metrics': {'avg_wait_time': avg_wait}
                })
        
        # Vérifie la tendance des abandons
        abandonment_rates = metrics.get('abandonment_rates', [])
        if abandonment_rates:
            trend = self._calculate_trend(abandonment_rates)
            if trend > 0.05:  # Augmentation de 5% par période
                causes.append({
                    'type': 'increasing_abandonment',
                    'probability': 0.8,
                    'description': (
                        "Tendance à la hausse des abandons "
                        f"(+{trend*100:.1f}% par période)"
                    ),
                    'metrics': {'trend': trend}
                })
        
        return causes

    def _analyze_service_time_causes(
        self,
        anomaly: QueueAnomaly,
        context: Dict
    ) -> List[Dict]:
        """Analyse les causes des anomalies de temps de service"""
        causes = []
        metrics = context['historical_metrics']
        service_points = context['service_points']
        
        # Vérifie les temps de service moyens
        service_times = metrics.get('service_times', [])
        if service_times:
            avg_service = np.mean(service_times)
            target_time = metrics.get('target_service_time', 10)
            if avg_service > target_time * 1.3:  # 30% au-dessus de la cible
                causes.append({
                    'type': 'slow_service',
                    'probability': 0.8,
                    'description': (
                        "Temps de service supérieurs à la cible "
                        f"(moyenne: {avg_service:.1f} min)"
                    ),
                    'metrics': {'avg_service_time': avg_service}
                })
        
        # Vérifie l'efficacité individuelle
        low_efficiency_count = sum(
            1 for sp in service_points
            if sp['efficiency'] is not None and sp['efficiency'] < 0.6
        )
        if low_efficiency_count > 0:
            causes.append({
                'type': 'individual_performance',
                'probability': 0.7,
                'description': (
                    f"{low_efficiency_count} point(s) de service "
                    "avec une efficacité faible"
                ),
                'metrics': {'low_efficiency_count': low_efficiency_count}
            })
        
        return causes

    def _analyze_pattern_causes(
        self,
        anomaly: QueueAnomaly,
        context: Dict
    ) -> List[Dict]:
        """Analyse les causes des anomalies de motifs"""
        causes = []
        metrics = context['historical_metrics']
        
        # Vérifie les motifs cycliques
        if metrics.get('is_cyclical', False):
            causes.append({
                'type': 'cyclical_pattern',
                'probability': 0.7,
                'description': "Motif cyclique détecté",
                'metrics': {'is_cyclical': True}
            })
        
        # Vérifie les tendances à long terme
        for metric_name, values in metrics.items():
            if isinstance(values, list) and len(values) >= 10:
                trend = self._calculate_trend(values)
                if abs(trend) > 0.1:  # Changement significatif
                    causes.append({
                        'type': 'trend_pattern',
                        'probability': 0.6,
                        'description': (
                            f"Tendance significative pour {metric_name}: "
                            f"{'+' if trend > 0 else ''}{trend*100:.1f}%"
                        ),
                        'metrics': {
                            'metric': metric_name,
                            'trend': trend
                        }
                    })
        
        return causes

    def _generate_recommendations(
        self,
        anomaly: QueueAnomaly,
        causes: List[Dict],
        context: Dict
    ) -> List[Dict]:
        """Génère des recommandations basées sur les causes identifiées"""
        recommendations = []
        
        for cause in causes:
            if cause['type'] == 'resource_shortage':
                recommendations.append({
                    'type': 'add_resources',
                    'priority': 'high',
                    'description': (
                        "Augmenter temporairement le nombre de points de service "
                        "pour réduire la charge et les temps d'attente."
                    ),
                    'expected_impact': 'Réduction immédiate des temps d\'attente'
                })
            
            elif cause['type'] == 'efficiency_drop':
                recommendations.append({
                    'type': 'optimize_resources',
                    'priority': 'medium',
                    'description': (
                        "Optimiser l'allocation des ressources et "
                        "vérifier la formation du personnel."
                    ),
                    'expected_impact': 'Amélioration progressive de l\'efficacité'
                })
            
            elif cause['type'] == 'peak_demand':
                recommendations.append({
                    'type': 'demand_management',
                    'priority': 'medium',
                    'description': (
                        "Mettre en place des mesures de gestion de la demande "
                        "et informer les clients des périodes moins chargées."
                    ),
                    'expected_impact': 'Meilleure répartition de la charge'
                })
        
        return recommendations

    def resolve(
        self,
        anomaly: QueueAnomaly,
        resolution_data: Dict
    ) -> Dict:
        """Marque une anomalie comme résolue avec les détails de la résolution"""
        # Met à jour le statut
        anomaly.status = 'resolved'
        
        # Enregistre les détails de la résolution
        anomaly.resolution = {
            'resolution_time': datetime.now().isoformat(),
            'resolution_type': resolution_data.get('type', 'manual'),
            'actions_taken': resolution_data.get('actions', []),
            'effectiveness': resolution_data.get('effectiveness', None),
            'notes': resolution_data.get('notes', '')
        }
        
        anomaly.save()
        
        return {
            'anomaly_id': anomaly.id,
            'status': 'resolved',
            'resolution': anomaly.resolution
        }

    def _is_peak_time(self, time: datetime) -> bool:
        """Détermine si c'est une période de pointe"""
        hour = time.hour
        return (
            (9 <= hour <= 11) or  # Pic du matin
            (14 <= hour <= 16)    # Pic de l'après-midi
        )

    def _calculate_trend(self, data: List[float]) -> float:
        """Calcule la tendance d'une série de données"""
        if not data:
            return 0
        x = np.arange(len(data))
        y = np.array(data)
        z = np.polyfit(x, y, 1)
        return z[0]
