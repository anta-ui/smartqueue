export type AdminRole = 'super_admin' | 'admin' | 'support' | 'billing' | 'readonly';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
  organizationId?: string;
  twoFactorEnabled: boolean;
}

export interface AdminActivity {
  id: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface SystemSettings {
  email: {
    provider: 'smtp' | 'sendgrid' | 'ses';
    config: Record<string, any>;
    templates: {
      welcome: string;
      passwordReset: string;
      invoices: string;
      alerts: string;
    };
  };
  sms: {
    provider: 'twilio' | 'nexmo';
    config: Record<string, any>;
    templates: Record<string, string>;
  };
  geolocation: {
    provider: 'google' | 'mapbox';
    apiKey: string;
    region: string;
  };
  integrations: {
    stripe: {
      enabled: boolean;
      config: Record<string, any>;
    };
    slack: {
      enabled: boolean;
      config: Record<string, any>;
    };
    github: {
      enabled: boolean;
      config: Record<string, any>;
    };
  };
}

export interface BrandingSettings {
  logo: {
    light: string;
    dark: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  customCss?: string;
  favicon?: string;
}

export interface LocalizationSettings {
  defaultLanguage: string;
  availableLanguages: string[];
  translations: Record<string, Record<string, string>>;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireNumbers: boolean;
    requireSymbols: boolean;
    requireUppercase: boolean;
    maxAge: number;
  };
  sessionPolicy: {
    maxConcurrentSessions: number;
    sessionTimeout: number;
    requireTwoFactor: boolean;
  };
  ipWhitelist: string[];
  auditLogRetention: number;
}
