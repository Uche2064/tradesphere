"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useRole } from "@/hooks/useAuth";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Spinner } from "@/lib/components/ui/spinner";
import { 
  Building2, 
  Users, 
  Store, 
  Package, 
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  User as UserIcon
} from "lucide-react";
import { RoleType, SubscriptionStatus } from "@/lib/constants/roles";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/components/ui/avatar";

interface Director {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
}

interface CompanyDetails {
  id: string;
  companyName: string;
  slug: string;
  companyEmail: string | null;
  companyPhone: string | null;
  companyAddress: string | null;
  businessType: string | null;
  country: string | null;
  companyLogo: string | null;
  subscriptionStatus: SubscriptionStatus;
  maxUsers: number;
  maxStores: number;
  createdAt: Date;
  updatedAt: Date;
  director: Director | null;
  _count?: {
    users?: number;
    stores?: number;
    products?: number;
    sales?: number;
  };
}

export default function CompanyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;
  
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const hasRole = useRole(RoleType.SUPERADMIN);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user && user.role.type !== RoleType.SUPERADMIN) {
      if (user.role.type === RoleType.DIRECTEUR) {
        router.push("/admin");
      } else {
        router.push("/app");
      }
      return;
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!accessToken || !companyId) return;

      try {
        const response = await axios.get(`/api/companies/${companyId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data.success) {
          setCompany(response.data.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'entreprise:", error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            toast.error("Entreprise non trouvée");
            router.push("/superadmin");
          } else {
            toast.error("Erreur lors du chargement de l'entreprise");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && companyId) {
      fetchCompany();
    }
  }, [accessToken, companyId, router]);

  const handleDelete = async () => {
    if (!accessToken || !company) return;
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'entreprise "${company.companyName}" ? Cette action est irréversible et supprimera toutes les données associées.`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      await axios.delete(`/api/companies/${companyId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast.success("Entreprise supprimée avec succès");
      router.push("/superadmin");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de l'entreprise");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!hasRole) {
    return null;
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Entreprise non trouvée</p>
        <Button onClick={() => router.push("/superadmin")}>
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "TRIAL":
        return "bg-yellow-100 text-yellow-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/superadmin/companies")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{company.companyName}</h1>
            <p className="text-muted-foreground">Détails de l&apos;entreprise</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Spinner />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer l&apos;entreprise
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations de l&apos;entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p className="text-lg">{company.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Slug</p>
                  <p className="text-lg font-mono">{company.slug}</p>
                </div>
                {company.companyEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-lg">{company.companyEmail}</p>
                    </div>
                  </div>
                )}
                {company.companyPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                      <p className="text-lg">{company.companyPhone}</p>
                    </div>
                  </div>
                )}
                {company.companyAddress && (
                  <div className="flex items-start gap-2 md:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                      <p className="text-lg">{company.companyAddress}</p>
                    </div>
                  </div>
                )}
                {company.businessType && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type d&apos;activité</p>
                    <p className="text-lg">{company.businessType}</p>
                  </div>
                )}
                {company.country && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pays</p>
                    <p className="text-lg">{company.country}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Abonnement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Abonnement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(
                      company.subscriptionStatus
                    )}`}
                  >
                    {company.subscriptionStatus}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilisateurs max</p>
                  <p className="text-lg">{company.maxUsers}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Magasins max</p>
                  <p className="text-lg">{company.maxStores}</p>
                </div>
                <div className="flex items-start gap-2 md:col-span-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                    <p className="text-lg">
                      {new Date(company.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Utilisateurs</p>
                    <p className="text-2xl font-bold">{company._count?.users || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      / {company.maxUsers} max
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Store className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Magasins</p>
                    <p className="text-2xl font-bold">{company._count?.stores || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      / {company.maxStores} max
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Produits</p>
                    <p className="text-2xl font-bold">{company._count?.products || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ventes</p>
                    <p className="text-2xl font-bold">{company._count?.sales || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
