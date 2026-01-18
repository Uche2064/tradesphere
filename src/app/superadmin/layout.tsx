"use client";

import { SuperAdminNavbar } from "@/components/superadmin/Navbar";
import { SuperAdminSidebar } from "@/components/superadmin/Sidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { RoleType } from "@/lib/constants/roles";
import { Spinner } from "@/lib/components/ui/spinner";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, _hasHydrated } = useAuthStore();
  const isMounted = typeof window !== "undefined";

  useEffect(() => {
    // Ne pas rediriger avant que le composant soit monté ET que Zustand soit hydraté
    if (!isMounted || !_hasHydrated || authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user && user.role.type !== RoleType.SUPERADMIN) {
      if (user.role.type === RoleType.DIRECTEUR) {
        router.push("/admin");
      } else {
        router.push("/app");
      }
    }
  }, [isMounted, _hasHydrated, authLoading, isAuthenticated, user, router]);

  // Afficher un spinner pendant le chargement initial ou l'hydratation
  if (!isMounted || !_hasHydrated || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // Ne rien afficher si pas authentifié ou pas le bon rôle (redirection en cours)
  if (!isAuthenticated || !user || user.role.type !== RoleType.SUPERADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SuperAdminNavbar />
      <SuperAdminSidebar />
      <main className="md:pl-64 pt-16">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
