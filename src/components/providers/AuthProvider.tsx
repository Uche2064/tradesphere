"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { usePermissionStore } from "@/stores/permissionStore";

/**
 * Provider pour initialiser les stores au démarrage de l'application
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const { loadPermissions } = usePermissionStore();

  useEffect(() => {
    // Si l'utilisateur est connecté, charger ses permissions
    if (isAuthenticated && user) {
      loadPermissions(user.id);
    }
  }, [isAuthenticated, user, loadPermissions]);

  return <>{children}</>;
}
