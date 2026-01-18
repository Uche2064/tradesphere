"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Spinner } from "@/lib/components/ui/spinner";
import { ArrowLeft, User, Mail, Phone, Building2, Store, Shield, Calendar, Ban } from "lucide-react";
import { Badge } from "@/lib/components/ui/badge";
import { Avatar, AvatarFallback } from "@/lib/components/ui/avatar";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface UserDetail {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  mustChangePassword: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: string;
    type: string;
    description?: string;
  };
  company: {
    id: string;
    companyName: string;
    slug: string;
  };
  store?: {
    id: string;
    name: string;
    slug: string;
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function MemberDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await apiClient.get(`/api/users/${userId}`);

        if (response.data.success) {
          setUser(response.data.data);
        } else {
          setError("Membre non trouvé");
        }
      } catch (err: unknown) {
        console.error("Erreur lors du chargement du membre:", err);
        if (err instanceof AxiosError && err.response?.status === 404) {
          setError("Membre non trouvé ou accès non autorisé");
        } else {
          setError("Erreur lors du chargement du membre");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleToggleActive = async () => {
    if (!user) return;

    const newActiveStatus = !user.isActive;
    setIsToggling(true);

    try {
      const response = await apiClient.patch(`/api/users/${userId}`, {
        isActive: newActiveStatus,
      });

      if (response.data.success) {
        setUser(response.data.data);
        toast.success(
          newActiveStatus ? "Compte activé avec succès" : "Compte suspendu avec succès"
        );
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.error || "Erreur lors de la mise à jour du statut";
        toast.error(errorMessage);
      } else {
        toast.error("Erreur lors de la mise à jour du statut");
      }
      console.error("Erreur lors de la mise à jour du statut:", err);
    } finally {
      setIsToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error || "Membre non trouvé"}</p>
        <Button onClick={() => router.push("/admin/team")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/admin/team")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8" />
              Détails du membre
            </h1>
            <p className="text-muted-foreground mt-1">
              Informations du membre de l&apos;équipe
            </p>
          </div>
        </div>
        <Button
          variant={user.isActive ? "destructive" : "default"}
          onClick={handleToggleActive}
          disabled={isToggling}
        >
          {isToggling ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              {user.isActive ? "Suspension..." : "Activation..."}
            </>
          ) : (
            <>
              {user.isActive ? (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Suspendre le compte
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Activer le compte
                </>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Informations principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              {user.avatar ? <img src={user.avatar} alt={user.fullName} /> : null}
              <AvatarFallback className="text-2xl">{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{user.fullName}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <Badge
                    variant={user.isActive ? "default" : "secondary"}
                    className={
                      user.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : ""
                    }
                  >
                    {user.isActive ? "Actif" : "Inactif"}
                  </Badge>
                  {user.mustChangePassword && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      Mot de passe à changer
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rôle</p>
                    <p className="font-medium">{user.role.name}</p>
                    {user.role.description && (
                      <p className="text-xs text-muted-foreground">{user.role.description}</p>
                    )}
                  </div>
                </div>

                {user.store && (
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Magasin</p>
                      <p className="font-medium">{user.store.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Entreprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{user.company.companyName}</p>
              <p className="text-sm text-muted-foreground">Slug: {user.company.slug}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dates importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Créé le</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {user.lastLoginAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Dernière connexion</p>
                  <p className="font-medium">
                    {new Date(user.lastLoginAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
              {user.emailVerifiedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Email vérifié le</p>
                  <p className="font-medium">
                    {new Date(user.emailVerifiedAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
