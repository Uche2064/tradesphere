import { create } from "zustand";
import { IPermissionState, IPermissionActions, IPermission } from "@/types";
import apiClient from "@/lib/axios";
import { useAuthStore } from "./authStore";

type PermissionStore = IPermissionState & IPermissionActions;

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  // État initial
  permissions: [],
  userPermissions: new Set<string>(),
  isLoading: false,

  // Actions
  loadPermissions: async (userId: string) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get(`/api/users/${userId}/permissions`);

      const permissions = response.data.data as IPermission[];
      const permissionSet = new Set(
        permissions.map((p) => `${p.resource}:${p.action}`)
      );

      set({
        permissions,
        userPermissions: permissionSet,
        isLoading: false,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des permissions:", error);
      set({ isLoading: false });
    }
  },

  can: (resource: string, action: string) => {
    const { userPermissions } = get();
    const { user } = useAuthStore.getState();

    // SuperAdmin a tous les droits
    // TODO: Restore RoleType.SUPERADMIN when schema is fixed with RoleType enum
    if (user?.role?.type === "SUPERADMIN" || user?.role?.name?.toUpperCase() === "SUPERADMIN") {
      return true;
    }

    return userPermissions.has(`${resource}:${action}`);
  },

  hasRole: (roleType: string) => {
    const { user } = useAuthStore.getState();
    return user?.role?.type === roleType || user?.role?.name?.toUpperCase() === roleType.toUpperCase();
  },

  isMultiTenantAdmin: () => {
    const { user } = useAuthStore.getState();
    const roleName = user?.role?.name?.toUpperCase();
    return (
      roleName === "SUPERADMIN" ||
      roleName === "DIRECTEUR" ||
      user?.role?.type === "SUPERADMIN" ||
      user?.role?.type === "DIRECTEUR"
    );
  },
}));
