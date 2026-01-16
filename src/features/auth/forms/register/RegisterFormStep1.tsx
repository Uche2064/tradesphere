import { User, Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppInput from "@/components/shared/AppInput";

interface RegisterFormProps {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  errors: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  isLoading: boolean;
  handleStep1Submit: () => void;
}

export default function RegisterFormStep1({
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  isLoading,
  handleStep1Submit,
}: RegisterFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Nom complet */}
      <AppInput
        id="fullName"
        label="Nom complet"
        placeholder="Jean Dupont"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
        leadingIcon={User}
        disabled={isLoading}
        required={true}
      />

      {/* Email */}
      <AppInput
        id="email"
        label="Email professionnel"
        type="email"
        placeholder="vous@entreprise.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        leadingIcon={Mail}
        disabled={isLoading}
        required={true}
      />
      </div>

      {/* Mot de passe */}
      <AppInput
        id="password"
        label="Mot de passe"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        leadingIcon={Lock}
        showPasswordToggle
        disabled={isLoading}
        required={true}
      />

      {/* Confirmation mot de passe */}
      <AppInput
        id="confirmPassword"
        label="Confirmer le mot de passe"
        type="password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleStep1Submit();
          }
        }}
        error={errors.confirmPassword}
        leadingIcon={Lock}
        showPasswordToggle
        disabled={isLoading}
        required={true}
      />

      {/* Bouton Continuer */}
      <Button
        onClick={handleStep1Submit}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-5 mt-2"
      >
        {isLoading ? "Chargement..." : "Continuer"}
        {!isLoading && <LogIn />}
      </Button>
    </div>
  );
}
