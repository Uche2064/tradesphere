"use client";

import { useState, useEffect } from "react";
import { CardContent } from "@/lib/components/ui/card";
import FormHeader from "../../components/FormHeader";
import FormContainer from "../../components/FormContainer";
import { Button } from "@/lib/components/ui/button";
import { Spinner } from "@/lib/components/ui/spinner";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { getAppRouteName } from "@/lib/constants";
import { RouteNames } from "@/lib/enums";
import { TwoFactorType } from "../../../../../generated/prisma/enums";
import { Shield, Smartphone, Mail } from "lucide-react";
import Image from "next/image";
import AppInput from "@/lib/shared/components/AppInput";

export default function TwoFactorForm() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<TwoFactorType | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"select" | "setup" | "verify">("select");
  const { setup2FA, enable2FA, isLoading } = useAuthStore();

  // État pour l'email - initialisé à null pour éviter les erreurs d'hydratation
  const [email, setEmail] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Récupérer l'email depuis l'URL ou sessionStorage après le montage (pour éviter l'erreur d'hydratation)
  useEffect(() => {
    // Charger l'email et marquer comme monté
    const loadEmail = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const emailParam = searchParams.get("email");
      const storedEmail = sessionStorage.getItem("pendingChangePasswordEmail") || sessionStorage.getItem("pending2FAEmail");
      const foundEmail = emailParam || storedEmail || null;
      if (foundEmail) {
        setEmail(foundEmail);
      }
      setIsMounted(true);
    };
    
    loadEmail();
  }, []);

  const handleSelectType = async (type: TwoFactorType) => {
    setSelectedType(type);
    setStep("setup");

    try {
      // Passer l'email si disponible (pour setup sans auth)
      const result = await setup2FA(type, email || undefined);
      
      if (type === TwoFactorType.TOTP && result.qrCode) {
        setQrCode(result.qrCode);
        setStep("verify");
      } else if (type === TwoFactorType.EMAIL) {
        toast.success("Un code a été envoyé à votre email");
        setStep("verify");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la configuration 2FA";
      toast.error(errorMessage);
      setStep("select");
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      toast.error("Veuillez entrer un code valide");
      return;
    }

    try {
      // Passer l'email si disponible (pour activation sans auth)
      const result = await enable2FA(verificationCode, email || undefined);
      
      toast.success("2FA activée avec succès !");
      
      // Si tokens retournés (après setup sans auth), rediriger vers le dashboard
      if (result?.redirectTo) {
        // Nettoyer les données de session
        sessionStorage.removeItem("pendingChangePasswordEmail");
        sessionStorage.removeItem("pending2FAEmail");
        router.push(result.redirectTo);
      } else {
        // Sinon, rediriger vers login
        router.push(getAppRouteName(RouteNames.login));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Code invalide";
      toast.error(errorMessage);
    }
  };

  // Utiliser des valeurs stables pour éviter les erreurs d'hydratation
  const showEmailContext = isMounted && email;
  const currentStep = step === "select" ? (showEmailContext ? 2 : 0) : (showEmailContext ? 2 : 1);
  const currentTotalSteps = showEmailContext ? 2 : 1;
  const stepDescription = showEmailContext
    ? "Pour accéder à votre espace d'administration, vous devez activer l'authentification à deux facteurs. Choisissez votre méthode préférée"
    : "Pour renforcer la sécurité de votre compte, activez l'authentification à deux facteurs. Choisissez votre méthode préférée";

  if (step === "select") {
    return (
      <FormContainer>
        <FormHeader
          step={currentStep}
          totalSteps={currentTotalSteps}
          title="Configuration 2FA"
          description={stepDescription}
        />
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Button
              onClick={() => handleSelectType(TwoFactorType.TOTP)}
              disabled={isLoading}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                <span className="font-semibold">Application Authenticator</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Utilisez une application comme Google Authenticator ou Authy
              </span>
            </Button>

            <Button
              onClick={() => handleSelectType(TwoFactorType.EMAIL)}
              disabled={isLoading}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span className="font-semibold">Code par Email</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Recevez un code par email à chaque connexion
              </span>
            </Button>
          </div>
        </CardContent>
      </FormContainer>
    );
  }

  if (step === "verify") {
    return (
      <FormContainer>
        <FormHeader
          step={currentStep}
          totalSteps={currentTotalSteps}
          title="Vérification 2FA"
          description={
            selectedType === TwoFactorType.TOTP
              ? "Scannez le QR code avec votre application d'authentification (Google Authenticator, Authy, etc.) et entrez le code généré ci-dessous"
              : "Vérifiez votre boîte email et entrez le code de vérification à 6 chiffres que nous vous avons envoyé"
          }
        />
        <CardContent className="space-y-4">
          {selectedType === TwoFactorType.TOTP && qrCode && (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg">
                <Image
                  src={qrCode}
                  alt="QR Code 2FA"
                  width={200}
                  height={200}
                  className="rounded"
                />
              </div>
            </div>
          )}

          <AppInput
            id="verification-code"
            label="Code de vérification"
            type="text"
            placeholder="123456"
            value={verificationCode}
            leadingIcon={Shield}
            onChange={(e) =>
              setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleVerifyAndEnable();
              }
            }}
            disabled={isLoading}
          />

          <Button
            onClick={handleVerifyAndEnable}
            disabled={isLoading || verificationCode.length < 6}
            size="icon-lg"
            className="w-full"
          >
            {isLoading ? <Spinner /> : "Activer la 2FA"}
          </Button>

          <Button
            onClick={() => {
              setStep("select");
              setQrCode(null);
              setVerificationCode("");
            }}
            variant="ghost"
            className="w-full"
          >
            Retour
          </Button>
        </CardContent>
      </FormContainer>
    );
  }

  return null;
}

