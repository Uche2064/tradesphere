import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Database,
  Fingerprint,
  Lock,
  Shield,
} from "lucide-react";

export default function Security() {
  return (
    <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl p-8 md:p-12 lg:p-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-white/10 dark:bg-white/5 text-white border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10">
                Sécurité & fiabilité
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Vos données sont notre priorité absolue
              </h2>
              <p className="text-lg text-slate-300 dark:text-slate-400 mb-8">
                TradeSphere applique les standards les plus exigeants en matière
                de sécurité et de protection des données. Votre commerce mérite
                la tranquillité d&apos;esprit.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 dark:bg-blue-500/30 rounded-lg flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-blue-400 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      Isolation des données
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                      Architecture multi-tenant avec séparation stricte. Chaque
                      commerce dispose de son propre espace sécurisé et isolé.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500/20 dark:bg-purple-500/30 rounded-lg flex items-center justify-center shrink-0">
                    <Fingerprint className="w-5 h-5 text-purple-400 dark:text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      Authentification renforcée
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                      JWT sécurisés, 2FA obligatoire pour les administrateurs,
                      gestion fine des sessions et révocation instantanée.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-500/20 dark:bg-orange-500/30 rounded-lg flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5 text-orange-400 dark:text-orange-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      Transactions atomiques
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                      Intégrité garantie de vos opérations. Rollback automatique
                      en cas d&apos;erreur, zéro perte de données.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/5 dark:bg-white/3 backdrop-blur border border-white/10 dark:border-white/5 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 dark:border-white/5">
                    <span className="text-white font-semibold">
                      Sécurité système
                    </span>
                    <Badge className="bg-green-500/20 dark:bg-green-500/30 text-green-400 dark:text-green-300 border-green-500/30 dark:border-green-500/20">
                      Actif
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 dark:text-green-300" />
                        <span className="text-white text-sm">
                          Two-Factor Auth
                        </span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">Requis</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 dark:text-green-300" />
                        <span className="text-white text-sm">Data Backup</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">Quotidien</span>
                    </div>
                   
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 dark:text-green-300" />
                        <span className="text-white text-sm">
                          RGPD Compliant
                        </span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">Certifié</span>
                    </div>
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