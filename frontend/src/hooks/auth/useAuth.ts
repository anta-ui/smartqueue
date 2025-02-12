import { create } from "zustand";
import { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  isEmailVerified: boolean;
  requires2FA: boolean;
  is2FAEnabled: boolean;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setEmailVerified: (verified: boolean) => void;
  setRequires2FA: (required: boolean) => void;
  set2FAEnabled: (enabled: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isEmailVerified: false,
  requires2FA: false,
  is2FAEnabled: false,
  loading: false,
  error: null,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setUser: (user: User | null) =>
    set({
      user,
      isEmailVerified: user?.emailVerified ?? false,
      is2FAEnabled: user?.twoFactorEnabled ?? false,
    }),

  setEmailVerified: (verified: boolean) =>
    set((state) => ({
      isEmailVerified: verified,
      user: state.user ? { ...state.user, emailVerified: verified } : null,
    })),

  setRequires2FA: (required: boolean) =>
    set({
      requires2FA: required,
    }),

  set2FAEnabled: (enabled: boolean) =>
    set((state) => ({
      is2FAEnabled: enabled,
      user: state.user ? { ...state.user, twoFactorEnabled: enabled } : null,
    })),

  setLoading: (loading: boolean) =>
    set({
      loading,
      error: loading ? null : null,
    }),

  setError: (error: string | null) =>
    set({
      error,
      loading: false,
    }),

  reset: () => set(initialState),
}));
