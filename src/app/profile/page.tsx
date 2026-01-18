"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/lib/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/components/ui/avatar";
import { Button } from "@/lib/components/ui/button";
import { Mail, Phone, Building2, Shield, Calendar, Store as StoreIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const initials = getInitials(user.fullName);

  const handleChangePassword = () => {
    router.push("/auth/change-password");
  };

  const handleManage2FA = () => {
    if (user.isTwoFactor) {
      toast.info("La gestion de la 2FA sera disponible prochainement");
    } else {
      router.push("/auth/two-factor");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      {/* Informations principales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Vos informations de compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.fullName} />
              ) : null}
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.fullName}</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                  <p className="text-lg">{user.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rôle</p>
                <p className="text-lg">{user.role.name}</p>
              </div>
            </div>
            {user.company && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entreprise</p>
                  <p className="text-lg">{user.company.companyName}</p>
                </div>
              </div>
            )}
            {user.store && (
              <div className="flex items-center gap-2">
                <StoreIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Magasin</p>
                  <p className="text-lg">{user.store.name}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Authentification 2FA</p>
                <p className="text-lg">
                  {user.isTwoFactor ? (
                    <span className="text-green-600 dark:text-green-400">Activée</span>
                  ) : (
                    <span className="text-gray-500">Désactivée</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleChangePassword}>
              Modifier le mot de passe
            </Button>
            <Button variant="outline" onClick={handleManage2FA}>
              {user.isTwoFactor ? "Gérer la 2FA" : "Activer la 2FA"}
            </Button>
            <Button variant="outline" disabled>
              Modifier le profil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
