import { getApiUrl } from "@/lib/constants";
import { ApiRouteNames } from "@/lib/enums";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

/**
 * Service de connexion qui utilise le store Zustand
 * @deprecated Utilisez directement useAuthStore().login() dans les composants
 */
export async function login(email: string, password: string) {
  const { login: loginAction } = useAuthStore.getState();
  return await loginAction(email, password);
}
