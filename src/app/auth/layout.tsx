import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ModeToggle } from "@/components/shared/ModeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative">
      {/* ModeToggle en haut à droite */}
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      {/* Partie gauche */}
      <div className="hidden lg:flex items-center justify-center bg-blue-600 dark:bg-blue-700 relative overflow-hidden">
        <div className="space-y-4 text-white relative z-10">
          <h1 className="text-3xl font-bold">
            <span className="text-black">Trade</span>Sphere
          </h1>
          <Link
            href="/"
            className="px-4 py-3 bg-black rounded-lg flex items-center gap-2 hover:bg-black/80 transform hover:-translate-x-1 transition-all duration-300"
          >
            <ChevronLeft />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </div>

      {/* Partie droite */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
