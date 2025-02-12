import { api } from "../api";
import { User } from "@/types/auth";
import { tokenService } from "./tokenService";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
}

interface TwoFactorStatus {
  isEnabled: boolean;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials);
    tokenService.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/register", userData);
    tokenService.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const { data } = await api.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
    
    tokenService.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    
    return data;
  }

  async logout(): Promise<void> {
    const refreshToken = tokenService.getRefreshToken();
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refreshToken });
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
    tokenService.clearTokens();
  }

  async me(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  }

  isAuthenticated(): boolean {
    const token = tokenService.getAccessToken();
    return token !== null && tokenService.isTokenValid(token);
  }

  // Méthodes de vérification d'email
  async verifyEmail(token: string): Promise<void> {
    await api.post("/auth/verify-email", { token });
  }

  async resendVerification(): Promise<void> {
    await api.post("/auth/resend-verification");
  }

  // Méthodes de réinitialisation de mot de passe
  async requestPasswordReset(email: string): Promise<void> {
    await api.post("/auth/request-reset", { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
  }

  // Méthodes d'authentification à deux facteurs
  async setup2FA(): Promise<TwoFactorSetupResponse> {
    const { data } = await api.post<TwoFactorSetupResponse>("/auth/2fa/setup");
    return data;
  }

  async enable2FA(secret: string, code: string): Promise<void> {
    await api.post("/auth/2fa/enable", { secret, code });
  }

  async verify2FA(code: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/2fa/verify", { code });
    tokenService.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data;
  }

  async disable2FA(code: string): Promise<void> {
    await api.post("/auth/2fa/disable", { code });
  }

  async check2FAStatus(): Promise<TwoFactorStatus> {
    const { data } = await api.get<TwoFactorStatus>("/auth/2fa/status");
    return data;
  }
}

export const authService = new AuthService();
