"use client";

import { CardContent } from "@/lib/components/ui/card";
import FormHeader from "../../components/FormHeader";
import AppInput from "@/lib/shared/components/AppInput";
import { Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { Spinner } from "@/lib/components/ui/spinner";
import { Button } from "@/lib/components/ui/button";
import Link from "next/link";
import { validateConfirmPassword, validatePassword } from "@/lib/validators";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { RouteNames } from "@/lib/enums";
import { useRouter } from "next/navigation";
import { getAppRouteName } from "@/lib/constants";
import FormContainer from "../../components/FormContainer";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Store Zustand
  const { changePassword, isLoading, error, clearError } = useAuthStore();

  // État pour l'email - initialisé à null pour éviter les erreurs d'hydratation
  const [email, setEmail] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Récupérer l'email depuis l'URL ou sessionStorage après le montage (pour éviter l'erreur d'hydratation)
  useEffect(() => {
    // Marquer comme monté et charger l'email
    const loadEmail = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const emailParam = searchParams.get("email");
      const storedEmail = sessionStorage.getItem("pendingChangePasswordEmail");
      const foundEmail = emailParam || storedEmail || null;
      if (foundEmail) {
        setEmail(foundEmail);
      }
      setIsMounted(true);
    };
    
    loadEmail();
  }, []);

  // Afficher les erreurs du store
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async () => {
    // Validation
    const newPasswordError = validatePassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      newPassword
    );

    // Réinitialiser les erreurs
    setErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    // Vérifications
    if (!currentPassword) {
      setErrors((prev) => ({
        ...prev,
        currentPassword: "Le mot de passe actuel est requis",
      }));
      return;
    }

    if (newPasswordError) {
      setErrors((prev) => ({
        ...prev,
        newPassword: newPasswordError,
      }));
      return;
    }

    if (confirmPasswordError || newPassword !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmPasswordError || "Les mots de passe ne correspondent pas",
      }));
      return;
    }

    try {
      const result = await changePassword(currentPassword, newPassword, email || undefined);
      
      // Si setup 2FA requis (obligatoire pour SUPERADMIN/DIRECTEUR après changement de mot de passe)
      // Utiliser l'email du résultat si disponible, sinon celui de l'état local
      if (result?.mustSetup2FA) {
        const emailToUse = result.email || email;
        if (emailToUse) {
          toast.success("Mot de passe changé avec succès !");
          router.push(`/auth/two-factor?email=${encodeURIComponent(emailToUse)}`);
        } else {
          toast.error("Erreur : email non disponible pour la configuration 2FA");
        }
        return;
      }

      // Sinon, connexion réussie
      if (result?.redirectTo) {
        toast.success("Mot de passe changé avec succès !");
        router.push(result.redirectTo);
      } else {
        toast.success("Mot de passe changé avec succès !");
        router.push(getAppRouteName(RouteNames.login));
      }
    } catch (err: unknown) {
      // L'erreur est déjà gérée par le store et affichée via toast dans le useEffect
      // Ici on log juste pour le debug, mais le toast.error est déjà affiché par le useEffect
      console.error("Erreur lors du changement de mot de passe:", err);
    }
  };
  // Utiliser une valeur stable pour éviter les erreurs d'hydratation
  // Si isMounted est false, on utilise 1 pour totalSteps (valeur par défaut côté serveur)
  const totalSteps = isMounted && email ? 2 : 1;
  const description = isMounted && email 
    ? "Pour votre première connexion, veuillez définir un nouveau mot de passe sécurisé" 
    : "Veuillez définir un nouveau mot de passe sécurisé pour continuer";

  return (
    <FormContainer >
      <FormHeader
        showAsteriskPrompt={true}
        step={1}
        totalSteps={totalSteps}
        title="Changement de mot de passe"
        description={description}
      />
      <CardContent className="space-y-4">
        {/* Mot de passe actuel */}
        <AppInput
          id="currentPassword"
          label="Mot de passe actuel *"
          type="password"
          placeholder="••••••••"
          value={currentPassword}
          error={errors.currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          showPasswordToggle={true}
          leadingIcon={Lock}
          disabled={isLoading}
          required={true}
        />
        {/* Nouveau mot de passe */}
        <AppInput
          id="newPassword"
          label="Nouveau mot de passe *"
          type="password"
          placeholder="••••••••"
          value={newPassword}
          error={errors.newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          showPasswordToggle={true}
          leadingIcon={Lock}
          disabled={isLoading}
          required={true}
        />
        {/* Confirmation de mot de passe */}
        <AppInput
          id="confirmPassword"
          label="Confirmer le nouveau mot de passe *"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          showPasswordToggle={true}
          leadingIcon={Lock}
          disabled={isLoading}
          required={true}
        />
        {/* Bouton de connexion */}
        <div className="flex items-center justify-between gap-8">
          <Link href={"/auth/login"}>Retour</Link>
          <Button
            className="w-50"
            onClick={handleSubmit}
            disabled={isLoading}
            size="icon-lg"
          >
            {isLoading ? <Spinner /> : "Envoyer"}
          </Button>
        </div>
      </CardContent>
    </FormContainer>
  );
}
