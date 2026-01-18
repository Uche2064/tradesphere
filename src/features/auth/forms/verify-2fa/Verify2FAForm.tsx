"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Spinner } from "@/lib/components/ui/spinner";
import AppInput from "@/lib/shared/components/AppInput";
import FormHeader from "../../components/FormHeader";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { usePermissionStore } from "@/stores/permissionStore";
import { getAppRouteName } from "@/lib/constants";
import { RouteNames } from "@/lib/enums";
import { Shield } from "lucide-react";

export default function Verify2FAForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({ code: "" });
  
  const { verify2FA, isLoading, error, isAuthenticated, user, clearError } = useAuthStore();
  const { loadPermissions } = usePermissionStore();

  const handlePost2FARedirect = useCallback((redirectTo?: string) => {
    if (!user) return;

    // Charger les permissions
    loadPermissions(user.id);

    // Utiliser redirectTo de la réponse API ou déterminer selon le rôle
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      // Fallback : redirection selon le rôle
      const roleType = user.role.type || user.role.name?.toUpperCase() || "";
      if (roleType === "SUPERADMIN") {
        router.push("/superadmin");
      } else if (roleType === "DIRECTEUR") {
        router.push("/admin");
      } else {
        router.push("/app");
      }
    }

    toast.success("Connexion réussie !");
  }, [user, loadPermissions, router]);

  // Redirection si déjà connecté (fallback si pas de redirectTo dans handleSubmit)
  useEffect(() => {
    if (isAuthenticated && user) {
      // Utiliser la logique de redirection basée sur le rôle
      handlePost2FARedirect();
    }
  }, [isAuthenticated, user, handlePost2FARedirect]);

  // Afficher les erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async () => {
    if (!code || code.length < 6) {
      setErrors({ code: "Le code doit contenir au moins 6 caractères" });
      return;
    }

    setErrors({ code: "" });

    try {
      const result = await verify2FA(code);
      
      // Redirection après vérification 2FA réussie
      if (result?.redirectTo) {
        router.push(result.redirectTo);
        toast.success("Connexion réussie !");
      }
      // Si pas de redirectTo, la redirection sera gérée par useEffect après mise à jour du user
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur de vérification 2FA";
      console.error("Erreur de vérification 2FA:", errorMessage);
    }
  };

  return (
    <Card className="dark:bg-black/30 shadow-md dark:shadow-md">
      <FormHeader
        step={0}
        title="Vérification 2FA"
        description="Entrez le code de vérification à deux facteurs"
      />
      <CardContent className="space-y-4">
        <AppInput
          id="code"
          label="Code de vérification"
          type="text"
          placeholder="123456"
          value={code}
          leadingIcon={Shield}
          error={errors.code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          disabled={isLoading}
        />

        <Button
          onClick={handleSubmit}
          disabled={isLoading || code.length < 6}
          size="icon-lg"
          className="w-full"
        >
          {isLoading ? <Spinner /> : "Vérifier"}
        </Button>
      </CardContent>
      <CardFooter className="text-center">
        <div className="text-center w-full">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Vous n&apos;avez pas reçu le code ?{" "}
            <button
              onClick={() => router.push(getAppRouteName(RouteNames.login))}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Réessayer
            </button>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
