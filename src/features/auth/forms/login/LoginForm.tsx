"use client";

import AppInput from "@/lib/shared/components/AppInput";
import { Button } from "@/lib/components/ui/button";
import { Spinner } from "@/lib/components/ui/spinner";
import { Lock, Mail } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/lib/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { validateEmail, validatePasswordForLogin } from "@/lib/validators";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormHeader from "../../components/FormHeader";
import { getAppRouteName } from "@/lib/constants";
import { RouteNames } from "@/lib/enums";
import { useAuthStore } from "@/stores/authStore";
import { usePermissionStore } from "@/stores/permissionStore";
import { RoleType } from "@/lib/constants/roles";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  // Stores Zustand
  const { login, isLoading, error, isAuthenticated, user, clearError } = useAuthStore();
  const { loadPermissions } = usePermissionStore();
  const [hasHandledRedirect, setHasHandledRedirect] = useState(false);

  const handlePostLoginRedirect = useCallback(() => {
    if (!user || hasHandledRedirect) return;

    // Si doit changer le mot de passe
    if (user.mustChangePassword) {
      router.push(getAppRouteName(RouteNames.changePassword));
      setHasHandledRedirect(true);
      return;
    }

    // Si SuperAdmin ou Directeur sans 2FA
    if (
      (user.role.type === RoleType.SUPERADMIN || user.role.type === RoleType.DIRECTEUR) &&
      !user.isTwoFactor
    ) {
      toast.info("Vous devez activer l'authentification à deux facteurs pour accéder à l'administration");
      router.push(getAppRouteName(RouteNames.twoFactor));
      setHasHandledRedirect(true);
      return;
    }

    // Charger les permissions
    loadPermissions(user.id);

    // Redirection selon le rôle
    if (user.role.type === RoleType.SUPERADMIN) {
      router.push("/superadmin");
    } else if (user.role.type === RoleType.DIRECTEUR) {
      router.push("/admin");
    } else {
      router.push("/app");
    }

    setHasHandledRedirect(true);
  }, [user, router, loadPermissions, hasHandledRedirect]);

  // Redirection automatique si déjà connecté (SANS afficher le toast)
  // Cela se produit quand l'utilisateur arrive sur la page de login alors qu'il est déjà connecté
  useEffect(() => {
    if (isAuthenticated && user && !hasHandledRedirect) {
      handlePostLoginRedirect();
    }
  }, [isAuthenticated, user, handlePostLoginRedirect, hasHandledRedirect]);

  // Afficher les erreurs du store
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async () => {
    // Validation
    const emailError = validateEmail(email);
    const passwordError = validatePasswordForLogin(password);
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    // Réinitialiser les erreurs
    setErrors({ email: "", password: "" });

    try {
      const result = await login(email, password);
      
      // Gérer les différents cas de retour
      if (result?.requires2FA) {
        router.push("/auth/verify-2fa");
        toast.info("Code de vérification requis");
        return;
      }

      if (result?.mustChangePassword) {
        // Stocker l'email pour le changement de mot de passe
        sessionStorage.setItem("pendingChangePasswordEmail", email);
        router.push(`/auth/change-password?email=${encodeURIComponent(email)}`);
        toast.info("Vous devez changer votre mot de passe");
        return;
      }

      if (result?.mustSetup2FA) {
        // Stocker l'email pour le setup 2FA
        sessionStorage.setItem("pendingChangePasswordEmail", email);
        router.push(`/auth/two-factor?email=${encodeURIComponent(email)}`);
        toast.info("Vous devez configurer l'authentification à deux facteurs");
        return;
      }

      // Connexion réussie sans 2FA
      if (result?.redirectTo) {
        // Afficher le toast uniquement lors d'une vraie connexion
        toast.success("Connexion réussie !");
        // Réinitialiser le flag pour permettre la redirection
        setHasHandledRedirect(false);
        // Attendre un tick pour que le store soit mis à jour, puis rediriger
        setTimeout(() => {
          handlePostLoginRedirect();
        }, 0);
      }
    } catch (err: unknown) {
      // L'erreur est déjà gérée par le store et affichée via toast
      console.error("Erreur de connexion:", err);
    }
  };
  return (
    <Card className="dark:bg-black/30 shadow-md dark:shadow-md">
      <FormHeader
        step={0}
        title="Bienvenue"
        description="Connectez-vous à votre compte pour continuer"
      />
      <CardContent className="space-y-4">
        <AppInput
          id="email"
          label="Email"
          type="email"
          placeholder="vous@entreprise.com"
          value={email}
          leadingIcon={Mail}
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        {/* Mot de passe */}
        <AppInput
          id="password"
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          showPasswordToggle={true}
          leadingIcon={Lock}
          disabled={isLoading}
        />

        {/* Bouton de connexion */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          size="icon-lg"
          className="w-full"
        >
          {isLoading ? <Spinner /> : "Se connecter"}
        </Button>
      </CardContent>
      <CardFooter className="text-center">
        {/* Lien d'inscription */}
        <div className="text-center w-full">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Vous n&apos;avez pas encore de compte ?{" "}
            <Link
              href={getAppRouteName(RouteNames.register)}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
