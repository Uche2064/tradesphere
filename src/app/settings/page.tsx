"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Settings, Bell, Shield, Database, Mail, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { RoleType } from "@/lib/constants/roles";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const isSuperAdmin = user.role.type === RoleType.SUPERADMIN;
  const isDirector = user.role.type === RoleType.DIRECTEUR;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Paramètres
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos paramètres et préférences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mon compte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Mon compte
            </CardTitle>
            <CardDescription>
              Paramètres de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => router.push("/profile")}
            >
              Modifier mon profil
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push("/auth/change-password")}
            >
              Changer mon mot de passe
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push(user.isTwoFactor ? "/settings/2fa" : "/auth/two-factor")}
            >
              {user.isTwoFactor ? "Gérer la 2FA" : "Activer la 2FA"}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Gérer vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" disabled>
              Paramètres email
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              Notifications push
            </Button>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Paramètres de sécurité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" disabled>
              Sessions actives
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              Historique de connexion
            </Button>
          </CardContent>
        </Card>

        {/* Intégrations */}
        {(isSuperAdmin || isDirector) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Intégrations
              </CardTitle>
              <CardDescription>
                Services et API externes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" disabled>
                Configuration email
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                API Keys
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Paramètres de l'entreprise (Directeur uniquement) */}
        {isDirector && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres de l&apos;entreprise
              </CardTitle>
              <CardDescription>
                Configuration de votre entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" disabled>
                Informations de l&apos;entreprise
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Paramètres de la plateforme (SuperAdmin uniquement) */}
        {isSuperAdmin && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres généraux
                </CardTitle>
                <CardDescription>
                  Configuration générale de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" disabled>
                  Paramètres de l&apos;application
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  Configuration des abonnements
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  Limites et quotas
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Base de données
                </CardTitle>
                <CardDescription>
                  Gestion et sauvegarde des données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" disabled>
                  Sauvegardes
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  Logs d&apos;audit
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
