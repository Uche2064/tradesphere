"use client";

import AppInput from "@/components/shared/AppInput";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {  Lock, Mail } from "lucide-react";
import Image from "next/image";
import LoginFormHeader from "./LoginHeader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useState } from "react";
import Link from "next/link";
import { validateEmail, validatePasswordForLogin } from "@/lib/validators";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePasswordForLogin(password);
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }
    setIsLoading(true);
  };
  return (
    <Card className="dark:bg-black/30 shadow-md dark:shadow-md">
      <LoginFormHeader title="Bienvenue" description="Connectez-vous à votre compte pour continuer" />
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
              href="/auth/register"
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
