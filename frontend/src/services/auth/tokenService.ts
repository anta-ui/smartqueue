import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  sub: string;
  role: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

class TokenService {
  private static readonly ACCESS_TOKEN_KEY = "access_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";

  setTokens(tokens: Tokens): void {
    if (typeof window === 'undefined') return;
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return this.getCookie(TokenService.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return this.getCookie(TokenService.REFRESH_TOKEN_KEY);
  }

  private setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    this.setCookie(TokenService.ACCESS_TOKEN_KEY, token, 15); // 15 minutes
  }

  private setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    this.setCookie(TokenService.REFRESH_TOKEN_KEY, token, 60 * 24 * 7); // 7 days
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    this.deleteCookie(TokenService.ACCESS_TOKEN_KEY);
    this.deleteCookie(TokenService.REFRESH_TOKEN_KEY);
  }

  isTokenValid(token: string | null): boolean {
    if (!token) return false;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private setCookie(name: string, value: string, minutesValid: number): void {
    try {
      const expires = new Date(Date.now() + minutesValid * 60 * 1000);
      const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; Secure; SameSite=Strict`;
      document.cookie = cookieString;
    } catch (error) {
      console.error('Error setting cookie:', error);
    }
  }

  private getCookie(name: string): string | null {
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
        if (cookieName === name) {
          return cookieValue;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return null;
    }
  }

  private deleteCookie(name: string): void {
    try {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=Strict`;
    } catch (error) {
      console.error('Error deleting cookie:', error);
    }
  }

  // Méthode utilitaire pour vérifier si nous sommes côté client
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // Méthode pour vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token !== null && this.isTokenValid(token);
  }
}

export const tokenService = new TokenService();