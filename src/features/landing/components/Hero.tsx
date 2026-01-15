


import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function HeroSection() {

  return (
    <section className="pt-28 pb-28 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-col-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800">
              Plateforme SaaS de gestion commerciale
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              Gérez tous vos commerces depuis une seule plateforme
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              TradeSphere centralise vos ventes, stocks et équipes en temps
              réel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="text-lg h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
              >
                Créer mon espace
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-14 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
                Voir une démo
              </Button>
            </div>
            {/* <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                <span>Aucune carte requise</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                <span>Essai gratuit 14 jours</span>
              </div>
            </div> */}
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-tr from-blue-600/20 to-blue-600/20 dark:from-blue-500/30 dark:to-blue-500/30 blur-xl"></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Dashboard Principal
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                    <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">247K €</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">CA ce mois</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                    <ShoppingCart className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">1,834</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Ventes</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                    <Package className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">4,567</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Articles en stock</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                    <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">23</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Collaborateurs</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Performance
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      +12.5%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-linear-to-r from-blue-600 to-green-600 dark:from-blue-500 dark:to-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
