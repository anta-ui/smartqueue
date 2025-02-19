// Types pour les organisations
export interface OrganizationLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    activeUsers: number;
    status: 'active' | 'limited' | 'inactive';
  }
  
  // Types pour les logs système
  export interface SystemLog {
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    service: string;
    message: string;
  }
  
  // Étendre les types existants si nécessaire
  export interface Metrics {
    activeOrgs: number;
    mrr: number;
    systemUsage: number;
    systemHealth: number;
  }
  
  export interface ServiceStatus {
    api: 'healthy' | 'degraded' | 'down';
    websocket: 'healthy' | 'degraded' | 'down';
    thirdParty: 'healthy' | 'degraded' | 'down';
  }
  
  export interface SystemAlert {
    id: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: string;
  }
  
  export interface UsageData {
    date: string;
    value: number;
  }