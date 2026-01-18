"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { RoleType } from "@/lib/constants/roles";
import { Spinner } from "@/lib/components/ui/spinner";
import { SuperAdminNavbar } from "@/components/superadmin/Navbar";
import { SuperAdminSidebar } from "@/components/superadmin/Sidebar";
import { AdminNavbar } from "@/components/admin/Navbar";
import { AdminSidebar } from "@/components/admin/Sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, _hasHydrated } = useAuthStore();
  const isMounted = typeof window !== "undefined";

  useEffect(() => {
    if (!isMounted || !_hasHydrated || authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isMounted, _hasHydrated, authLoading, isAuthenticated, router]);

  if (!isMounted || !_hasHydrated || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Si SuperAdmin, utiliser le layout avec navbar/sidebar SuperAdmin
  if (user.role.type === RoleType.SUPERADMIN) {
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

  // Si Directeur, utiliser le layout avec navbar/sidebar Admin
  if (user.role.type === RoleType.DIRECTEUR) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <AdminSidebar />
        <main className="md:pl-64 pt-16">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    );
  }

  // Sinon, layout simple sans sidebar pour les autres rôles
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 mr-4">
            <h1 className="text-xl font-bold">TradeSphere</h1>
          </div>
          <div className="flex-1" />
        </div>
      </nav>
      <main className="pt-16">
        <div className="p-4 md:p-6 max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
