export interface LoginFormData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  organization: number;
  has_totp?: boolean;
  has_biometric?: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
