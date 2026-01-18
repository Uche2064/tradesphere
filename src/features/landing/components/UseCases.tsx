import { Card, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { CardDescription } from "@/lib/components/ui/card";
import { Building2, Store } from "lucide-react";
import { Database } from "lucide-react";
import { Badge } from "@/lib/components/ui/badge";

export default function UseCases() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            Cas d&apos;usage
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Conçu pour tous types de commerces
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Que vous soyez une boutique indépendante ou un réseau de magasins,
            TradeSphere s&apos;adapte à votre organisation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white dark:bg-slate-800 hover:shadow-lg dark:hover:shadow-blue-500/10 transition-shadow border-slate-200 dark:border-slate-700">
            <CardHeader>
              <Store className="w-12 h-12 text-blue-600 dark:text-blue-500 mb-4" />
              <CardTitle className="text-xl text-slate-900 dark:text-white">
                Boutiques indépendantes
              </CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                Simplicité et performance. Interface intuitive pour gérer vos
                ventes, stocks et caisse sans complications. Idéal pour les
                commerces de proximité qui cherchent à se digitaliser.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white dark:bg-slate-800 hover:shadow-lg dark:hover:shadow-purple-500/10 transition-shadow border-slate-200 dark:border-slate-700">
            <CardHeader>
              <Building2 className="w-12 h-12 text-purple-600 dark:text-purple-500 mb-4" />
              <CardTitle className="text-xl text-slate-900 dark:text-white">
                PME & moyennes enseignes
              </CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                Gestion d&apos;équipe avancée, reporting détaillé et contrôle
                multi-niveaux. Parfait pour structurer vos processus et
                accompagner votre croissance sereinement.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white dark:bg-slate-800 hover:shadow-lg dark:hover:shadow-orange-500/10 transition-shadow border-slate-200 dark:border-slate-700">
            <CardHeader>
              <Database className="w-12 h-12 text-orange-600 dark:text-orange-500 mb-4" />
              <CardTitle className="text-xl text-slate-900 dark:text-white">
                Réseaux de magasins
              </CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                Architecture multi-tenant robuste. Gérez des dizaines de points
                de vente avec une vision consolidée, des données isolées et des
                performances garanties à l&apos;échelle.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}
