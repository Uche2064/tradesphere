"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Spinner } from "@/lib/components/ui/spinner";
import { Users, Plus, Search } from "lucide-react";
import { Input } from "@/lib/components/ui/input";
import { Avatar, AvatarFallback } from "@/lib/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/ui/select";
import { Label } from "@/lib/components/ui/label";
import { toast } from "sonner";
import { validateEmail, validateField } from "@/lib/validators";
import { AxiosError } from "axios";

interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  role: {
    id: string;
    name: string;
    type: string;
  };
  store?: {
    id: string;
    name: string;
  };
}

interface Store {
  id: string;
  name: string;
  slug: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TeamPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  
  // Formulaire
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    roleType: "",
    storeId: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    fullName: "",
    phone: "",
    roleType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await apiClient.get("/api/team");
        if (response.data.success) {
          setUsers(response.data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'équipe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await apiClient.get("/api/stores");
        if (response.data.success) {
          setStores(response.data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des magasins:", error);
      }
    };

    fetchStores();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      email: "",
      fullName: "",
      phone: "",
      roleType: "",
      storeId: "",
    });
    setErrors({
      email: "",
      fullName: "",
      phone: "",
      roleType: "",
    });
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleSubmit = async () => {
    // Validation
    const emailError = validateEmail(formData.email);
    const fullNameError = validateField(formData.fullName);
    const roleTypeError = !formData.roleType ? "Le rôle est requis" : "";

    setErrors({
      email: emailError,
      fullName: fullNameError,
      phone: "",
      roleType: roleTypeError,
    });

    if (emailError || fullNameError || roleTypeError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: {
        email: string;
        fullName: string;
        phone?: string;
        roleType: string;
        storeId?: string;
      } = {
        email: formData.email,
        fullName: formData.fullName,
        roleType: formData.roleType,
      };

      if (formData.phone && formData.phone.trim()) {
        payload.phone = formData.phone;
      }

      // Convertir "__none__" en undefined pour ne pas envoyer storeId
      if (formData.storeId && formData.storeId !== "__none__" && formData.storeId.trim()) {
        payload.storeId = formData.storeId;
      }

      const response = await apiClient.post("/api/users", payload);

      if (response.data.success) {
        toast.success("Membre ajouté avec succès !");
        setDialogOpen(false);
        resetForm();
        // Rafraîchir la liste des utilisateurs
        const teamResponse = await apiClient.get("/api/team");
        if (teamResponse.data.success) {
          setUsers(teamResponse.data.data || []);
        }
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.error || "Erreur lors de l'ajout du membre";
        toast.error(errorMessage);
      } else {
        toast.error("Erreur lors de l'ajout du membre");
      }
      console.error("Erreur lors de l'ajout du membre:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Équipe
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre équipe (Gérants, Vendeurs, Magasiniers)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau membre
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau membre</DialogTitle>
              <DialogDescription>
                Créez un nouveau compte pour un membre de votre équipe. Un mot de passe temporaire sera généré automatiquement.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">
                  Nom complet <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Jean Dupont"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="roleType">
                  Rôle <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.roleType}
                  onValueChange={(value) => setFormData({ ...formData, roleType: value })}
                >
                  <SelectTrigger id="roleType" className={errors.roleType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GERANT">Gérant</SelectItem>
                    <SelectItem value="VENDEUR">Vendeur</SelectItem>
                    <SelectItem value="MAGASINIER">Magasinier</SelectItem>
                  </SelectContent>
                </Select>
                {errors.roleType && (
                  <p className="text-sm text-destructive">{errors.roleType}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="storeId">Magasin (optionnel)</Label>
                <Select
                  value={formData.storeId || "__none__"}
                  onValueChange={(value) => setFormData({ ...formData, storeId: value })}
                >
                  <SelectTrigger id="storeId">
                    <SelectValue placeholder="Sélectionner un magasin (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Aucun magasin</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Ajout...
                  </>
                ) : (
                  "Ajouter"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un membre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des membres */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des membres ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun membre trouvé. Cliquez sur &quot;Nouveau membre&quot; pour ajouter un membre à votre équipe.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/team/${user.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.fullName} />
                      ) : null}
                      <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{user.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {user.role.name}
                        </span>
                        {user.store && (
                          <span className="text-xs text-muted-foreground">
                            {user.store.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      }`}
                    >
                      {user.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
