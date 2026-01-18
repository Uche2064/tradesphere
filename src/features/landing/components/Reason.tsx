import {
  Card,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/lib/components/ui/card";
import { BarChart3, Shield, Zap } from "lucide-react";
import { Badge } from "@/lib/components/ui/badge";

export default function Reasons() {
  return (
    <section id="reason" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <Badge className="mb-4 bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700">
            Pourquoi TradeSphere ?
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Une solution pensée pour votre croissance
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Nous comprenons les défis quotidiens des commerces. TradeSphere vous
            libère des tâches chronophages.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700 transition-all hover:shadow-lg dark:hover:shadow-2xl dark:bg-slate-900">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="dark:text-white">Gain de temps massif</CardTitle>
              <CardDescription className="dark:text-slate-400">
                Automatisez vos processus répétitifs et concentrez-vous sur les
                éléments essentiels : développer votre activité. Économisez
                jusqu&apos;à 15 heures par semaine.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-700 transition-all hover:shadow-lg dark:hover:shadow-2xl dark:bg-slate-900">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="dark:text-white">Décisions éclairées</CardTitle>
              <CardDescription className="dark:text-slate-400">
                Tableaux de bord en temps réel, analytics avancés et rapports
                personnalisés. Prenez les bonnes décisions au bon moment.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-slate-200 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-700 transition-all hover:shadow-lg dark:hover:shadow-2xl dark:bg-slate-900">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="dark:text-white">Sécurité entreprise</CardTitle>
              <CardDescription className="dark:text-slate-400">
                Vos données sont isolées, chiffrées et sauvegardées.
                Authentification 2FA, contrôle d&apos;accès granulaire et
                conformité RGPD.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}
