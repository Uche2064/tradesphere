"use client";


import {
  Fingerprint,
  Lock,
  Package,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Features() {
  return (
    <section
      id="features"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <Badge className="mb-4 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800">
            Fonctionnalités
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Tout ce dont vous avez besoin, en un seul endroit
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-xl transition-shadow border border-transparent dark:border-slate-700">
            <ShoppingCart className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Gestion des ventes
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Interface de caisse intuitive, factures automatiques, historique
              complet et synchronisation instantanée.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-xl transition-shadow border border-transparent dark:border-slate-700">
            <Package className="w-10 h-10 text-orange-600 dark:text-orange-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Stocks en temps réel
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Suivez vos inventaires en direct, alertes de rupture, mouvements
              tracés et réapprovisionnement optimisé.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-xl transition-shadow border border-transparent dark:border-slate-700">
            <Store className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Multi-boutiques
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Gérez plusieurs points de vente depuis une interface unique.
              Vision consolidée et contrôle centralisé.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-xl transition-shadow border border-transparent dark:border-slate-700">
            <Users className="w-10 h-10 text-green-600 dark:text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Gestion d&apos;équipe
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Créez des comptes vendeurs, magasiniers, gérants. Suivi des
              performances et historique des actions.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-xl transition-shadow border border-transparent dark:border-slate-700">
            <Lock className="w-10 h-10 text-red-600 dark:text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Rôles & permissions
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Contrôle d&apos;accès granulaire (RBAC). Chaque utilisateur
              n&apos;accède qu&apos;aux données et aux actions nécessaires à son
              rôle.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-xl transition-shadow border border-transparent dark:border-slate-700">
            <Fingerprint className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Sécurité avancée
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Authentification JWT, 2FA obligatoire pour les admins, sessions
              sécurisées et audit logs complets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
