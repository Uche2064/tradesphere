import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IAuthState, IAuthActions, IUser } from "@/types";
import { TwoFactorType } from "../../generated/prisma/enums";
import axios from "axios";

// Fonction utilitaire pour extraire les messages d'erreur de manière cohérente
function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (axios.isAxiosError(error)) {
    // Extraire le message d'erreur de la réponse API
    const apiError = error.response?.data?.error || error.response?.data?.message;
    
    if (apiError) {
      return typeof apiError === "string" ? apiError : JSON.stringify(apiError);
    }
    
    // Messages d'erreur selon le code de statut HTTP
    switch (error.response?.status) {
      case 400:
        return "Les informations fournies ne sont pas valides. Veuillez vérifier tous les champs.";
      case 401:
        return "Votre session a expiré ou vous n'êtes pas autorisé. Veuillez vous reconnecter.";
      case 403:
        return "Accès refusé. Vous n'avez pas les permissions nécessaires.";
      case 404:
        return "La ressource demandée n'a pas été trouvée.";
      case 500:
        return "Une erreur serveur s'est produite. Veuillez réessayer plus tard.";
      default:
        return error.message || defaultMessage;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return defaultMessage;
}

// Type pour le store avec hydratation
type AuthStoreWithHydration = IAuthState & IAuthActions & {
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useAuthStore = create<AuthStoreWithHydration>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,
      
      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post("/api/auth/login", {
            email,
            password,
          });

          const { user, accessToken, refreshToken, requires2FA, mustChangePassword, mustSetup2FA, twoFactorType } = response.data;

          // Si 2FA requis, stocker l'email et retourner les infos
          if (requires2FA) {
            sessionStorage.setItem("pending2FAEmail", email);
            if (twoFactorType) {
              sessionStorage.setItem("pending2FAType", twoFactorType);
            }
            set({ isLoading: false, error: null });
            return { requires2FA: true, twoFactorType };
          }

          // Si changement de mot de passe requis
          if (mustChangePassword) {
            set({ isLoading: false, error: null });
            return { mustChangePassword: true };
          }

          // Si setup 2FA requis
          if (mustSetup2FA) {
            set({ isLoading: false, error: null });
            return { mustSetup2FA: true };
          }

          // Connexion réussie sans 2FA
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return { redirectTo: response.data.redirectTo };
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(error, "Une erreur s'est produite lors de la connexion. Veuillez réessayer.");
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        sessionStorage.removeItem("pending2FAEmail");
      },

      verify2FA: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const email = sessionStorage.getItem("pending2FAEmail");
          if (!email) {
            throw new Error("Session 2FA expirée");
          }

          const response = await axios.post("/api/auth/verify-2fa", {
            email,
            code,
          });

          const { user, accessToken, refreshToken, redirectTo } = response.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          sessionStorage.removeItem("pending2FAEmail");
          sessionStorage.removeItem("pending2FAType");

          return { redirectTo };
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(error, "Le code de vérification est incorrect ou a expiré. Veuillez réessayer.");
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      setup2FA: async (type: TwoFactorType, email?: string) => {
        set({ isLoading: true, error: null });
        try {
          const { accessToken } = get();
          const headers: Record<string, string> = {};
          
          // Si pas d'email fourni, utiliser le token
          if (!email && accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
          }

          const response = await axios.post(
            "/api/auth/2fa/setup",
            email ? { type, email } : { type },
            email ? {} : { headers }
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(error, "Une erreur s'est produite lors de la configuration de l'authentification à deux facteurs. Veuillez réessayer.");
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      enable2FA: async (code: string, email?: string) => {
        set({ isLoading: true, error: null });
        try {
          const { accessToken } = get();
          const headers: Record<string, string> = {};
          
          // Si pas d'email fourni, utiliser le token
          if (!email && accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
          }

          const response = await axios.post(
            "/api/auth/2fa/enable",
            email ? { code, email } : { code },
            email ? {} : { headers }
          );

          const { user, accessToken: newAccessToken, refreshToken: newRefreshToken, redirectTo } = response.data;

          // Si tokens retournés (après setup sans auth), les enregistrer
          if (newAccessToken && newRefreshToken && user) {
            set({
              user,
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return { redirectTo };
          }

          // Sinon, juste mettre à jour l'utilisateur
          set((state) => ({
            user: state.user ? { ...state.user, isTwoFactor: true } : null,
            isLoading: false,
          }));

          return { redirectTo: redirectTo || undefined };
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(error, "Le code de vérification est incorrect ou a expiré. Veuillez réessayer.");
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      disable2FA: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const { accessToken } = get();
          await axios.post(
            "/api/auth/2fa/disable",
            { code },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          set((state) => ({
            user: state.user ? { ...state.user, isTwoFactor: false } : null,
            isLoading: false,
          }));
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(error, "Le code de vérification est incorrect ou a expiré. Veuillez réessayer.");
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        try {
          const response = await axios.post("/api/auth/refresh", {
            refreshToken,
          });

          const { accessToken: newAccessToken } = response.data;

          set({ accessToken: newAccessToken });
        } catch (error) {
          // Si le refresh token est invalide, déconnecter l'utilisateur
          get().logout();
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string, email?: string) => {
        set({ isLoading: true, error: null });
        try {
          const { accessToken } = get();
          const headers: Record<string, string> = {};
          
          // Si pas d'email fourni, utiliser le token (connexion normale)
          if (!email && accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
          }

          const response = await axios.post(
            "/api/auth/change-password",
            email ? { currentPassword, newPassword, email } : { currentPassword, newPassword },
            email ? {} : { headers }
          );

          const { mustSetup2FA, user, accessToken: newAccessToken, refreshToken: newRefreshToken, redirectTo, email: responseEmail } = response.data;

          // Si setup 2FA requis (obligatoire pour SUPERADMIN/DIRECTEUR), forcer la configuration
          // Utiliser l'email de la réponse si disponible, sinon celui passé en paramètre
          if (mustSetup2FA) {
            const emailToUse = responseEmail || email;
            if (emailToUse) {
              sessionStorage.setItem("pending2FAEmail", emailToUse);
              sessionStorage.setItem("pendingChangePasswordEmail", emailToUse);
            }
            set({ isLoading: false, error: null });
            return { mustSetup2FA: true, email: emailToUse };
          }

          // Si tokens retournés (connexion normale ou 2FA pas obligatoire)
          if (newAccessToken && newRefreshToken && user) {
            set({
              user,
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return { redirectTo };
          }

          // Sinon, juste mettre à jour l'utilisateur
          set((state) => ({
            user: state.user ? { ...state.user, mustChangePassword: false } : null,
            isLoading: false,
          }));

          return { redirectTo: redirectTo || undefined };
        } catch (error: unknown) {
          // Messages spécifiques pour le changement de mot de passe
          let errorMessage = "Une erreur s'est produite lors du changement de mot de passe. Veuillez réessayer.";
          
          if (axios.isAxiosError(error)) {
            const apiError = error.response?.data?.error || error.response?.data?.message;
            
            if (apiError) {
              errorMessage = typeof apiError === "string" ? apiError : JSON.stringify(apiError);
            } else {
              // Messages personnalisés selon le code de statut pour le changement de mot de passe
              switch (error.response?.status) {
                case 400:
                  errorMessage = "Les informations fournies ne sont pas valides. Vérifiez que votre nouveau mot de passe respecte les critères requis et qu'il est différent de l'ancien.";
                  break;
                case 401:
                  errorMessage = "Votre mot de passe actuel est incorrect. Veuillez réessayer.";
                  break;
                case 404:
                  errorMessage = "Aucun compte trouvé avec cet email. Vérifiez votre adresse email.";
                  break;
                case 500:
                  errorMessage = "Une erreur serveur s'est produite. Veuillez réessayer plus tard ou contacter le support si le problème persiste.";
                  break;
                default:
                  errorMessage = extractErrorMessage(error, errorMessage);
              }
            }
          } else {
            errorMessage = extractErrorMessage(error, errorMessage);
          }
          
          console.error("Erreur détaillée lors du changement de mot de passe:", error);
          
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      setUser: (user: IUser) => {
        set({ user, isAuthenticated: true });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Marquer comme hydraté après la réhydratation
        state?.setHasHydrated(true);
      },
    }
  )
);
