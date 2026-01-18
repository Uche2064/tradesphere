import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { usePermissionStore } from "@/stores/permissionStore";
import { RoleType } from "@/lib/constants/roles";

/**
 * Hook personnalisé pour gérer l'authentification et les redirections
 */
export function useAuth(required: boolean = true) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { loadPermissions } = usePermissionStore();

  useEffect(() => {
    if (isLoading) return;

    if (required && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (isAuthenticated && user) {
      // Charger les permissions
      loadPermissions(user.id);
    }
  }, [isAuthenticated, isLoading, required, user, router, loadPermissions]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}

/**
 * Hook pour vérifier si l'utilisateur a un rôle spécifique
 */
export function useRole(requiredRole: RoleType) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role.type !== requiredRole) {
      // Rediriger selon le rôle actuel
      if (user.role.type === RoleType.SUPERADMIN) {
        router.push("/superadmin");
      } else if (user.role.type === RoleType.DIRECTEUR) {
        router.push("/admin");
      } else {
        router.push("/app");
      }
    }
  }, [user, requiredRole, router]);

  return user?.role.type === requiredRole;
}

/**
 * Hook pour vérifier les permissions
 */
export function usePermission(resource: string, action: string) {
  const { can } = usePermissionStore();
  return can(resource, action);
}
