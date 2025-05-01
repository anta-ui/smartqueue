// controllers/metrics.controller.ts
import { Request, Response } from 'express';
import { MetricsService } from '../services/metricsService';

const metricsService = new MetricsService();

export const getMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = await metricsService.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des métriques' });
  }
};

export const getServiceStatus = async (req: Request, res: Response) => {
  try {
    const status = await metricsService.getServiceStatus();
    res.json(status);
  } catch (error) {
    console.error('Erreur lors de la récupération du statut des services:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du statut des services' });
  }
};

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await metricsService.getAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des alertes' });
  }
};

export const getUsageData = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as 'day' | 'week' | 'month' || 'month';
    const usageData = await metricsService.getUsageData(period);
    res.json(usageData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'utilisation:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des données d\'utilisation' });
  }
};