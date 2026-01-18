import { Badge } from "@/lib/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { Clock } from "lucide-react";
import { TrendingUp } from "lucide-react";

export default function ProductShowcase() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <Badge className="mb-4 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900">
              Interface moderne
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Une interface pensée pour l&apos;efficacité
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              Notre dashboard centralise toutes vos données commerciales.
              Visualisez vos KPIs en un coup d&apos;œil, identifiez les
              tendances et anticipez les problèmes avant qu&apos;ils ne
              surviennent.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Tableaux de bord personnalisables
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Créez vos propres vues selon vos priorités métier
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Synchronisation instantanée
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Toutes vos boutiques connectées en temps réel
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Rapports exportables
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Excel, PDF, CSV pour vos analyses et comptabilité
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/10 to-purple-600/10 dark:from-blue-500/20 dark:to-purple-500/20 blur-2xl"></div>
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 shadow-2xl dark:shadow-blue-500/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-white/60 dark:text-white/70 text-sm mb-6">
                  <span>Analytics • Vue d&apos;ensemble</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 dark:bg-white/5 backdrop-blur rounded-lg p-4 border border-white/20 dark:border-white/10">
                    <p className="text-white/60 dark:text-white/50 text-xs mb-1">
                      Ventes aujourd&apos;hui
                    </p>
                    <p className="text-2xl font-bold text-white">8,942 FCFA</p>
                    <p className="text-green-400 dark:text-green-500 text-xs mt-1">+18.2%</p>
                  </div>
                  <div className="bg-white/10 dark:bg-white/5 backdrop-blur rounded-lg p-4 border border-white/20 dark:border-white/10">
                    <p className="text-white/60 dark:text-white/50 text-xs mb-1">Transactions</p>
                    <p className="text-2xl font-bold text-white">147</p>
                    <p className="text-green-400 dark:text-green-500 text-xs mt-1">+5.3%</p>
                  </div>
                </div>
                <div className="bg-white/5 dark:bg-white/[0.02] backdrop-blur rounded-lg p-4 border border-white/10 dark:border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white text-sm font-medium">
                      Top produits
                    </span>
                    <TrendingUp className="w-4 h-4 text-green-400 dark:text-green-500" />
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "Smartphone XR", value: 78 },
                      { name: "Casque Audio Pro", value: 65 },
                      { name: "Chargeur USB-C", value: 52 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/80 dark:text-white/70 text-xs">
                              {item.name}
                            </span>
                            <span className="text-white/60 dark:text-white/50 text-xs">
                              {item.value}
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/10 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-full"
                              style={{ width: `${item.value}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
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
