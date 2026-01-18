"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Store, LayoutDashboard } from "lucide-react";
import { ModeToggle } from "@/lib/shared/components/ModeToggle";
import { useAuthStore } from "@/stores/authStore";
import { RoleType } from "@/lib/constants/roles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/lib/components/ui/dropdown-menu";
import { Button } from "@/lib/components/ui/button";
import { Avatar, AvatarFallback } from "@/lib/components/ui/avatar";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDashboardPath(roleType: string): string {
  switch (roleType) {
    case RoleType.SUPERADMIN:
      return "/superadmin";
    case RoleType.DIRECTEUR:
      return "/admin";
    case RoleType.GERANT:
    case RoleType.VENDEUR:
    case RoleType.MAGASINIER:
      return "/app";
    default:
      return "/app";
  }
}

export default function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const initials = user ? getInitials(user.fullName) : "";
  const dashboardPath = user ? getDashboardPath(user.role.type) : "";

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                TradeSphere
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#reason"
              className="text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Pourquoi TradeSphere?
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Fonctionnalités
            </a>

            <a
              href="#security"
              className="text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sécurité & fiabilité
            </a>
            <a
              href="#cta"
              className="text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              CTA
            </a>
          </div>

          {/* CTA Buttons & Theme Switcher */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem
                    onClick={() => router.push(dashboardPath)}
                    className="cursor-pointer"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Go to dashboard</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md"
              >
                S&apos;authentifier
              </Link>
            )}
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
