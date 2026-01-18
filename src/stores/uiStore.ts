import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IUIState, IUIActions, INotification } from "@/types";

type UIStore = IUIState & IUIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // État initial
      sidebarOpen: true,
      theme: "system",
      notifications: [],

      // Actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setTheme: (theme: "light" | "dark" | "system") => {
        set({ theme });
      },

      addNotification: (notification: Omit<INotification, "id">) => {
        const id = Math.random().toString(36).substring(7);
        const newNotification: INotification = {
          ...notification,
          id,
          duration: notification.duration || 5000,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-supprimer après la durée spécifiée
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
      }),
    }
  )
);
