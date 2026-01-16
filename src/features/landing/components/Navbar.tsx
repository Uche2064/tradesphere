"use client";
import Link from "next/link";

import { Store } from "lucide-react";
import { ModeToggle } from "@/components/shared/ModeToggle";

interface NavbarProps {
  showNavigation: boolean;
  user?: {
    fullName: string;
    email: string;
    role: {
      name: string;
    };
  } | null;
  initials?: string;
  dashboardPath?: string;
}

export default function Navbar() {
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
            <>
              <Link
                href="/auth/login"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md"
              >
                S'authentifier
              </Link>
              <ModeToggle />
            </>
          </div>
        </div>
      </div>
    </nav>
  );
}
