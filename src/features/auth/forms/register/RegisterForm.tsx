"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/lib/components/ui/card";
import RegisterFormStep1 from "@/features/auth/forms/register/RegisterFormStep1";
import RegisterFormStep2 from "@/features/auth/forms/register/RegisterFormStep2";
import RegisterHeader from "@/features/auth/components/FormHeader";
import {
  validateConfirmPassword,
  validateEmail,
  validateField,
  validatePassword,
  validatePasswordForLogin,
} from "@/lib/validators";
import Link from "next/link";
import { useState } from "react";
import FormHeader from "@/features/auth/components/FormHeader";
import { getAppRouteName } from "@/lib/constants";
import { RouteNames } from "@/lib/enums";
import FormContainer from "../../components/FormContainer";

interface Country {
  name: {
    common: string;
  };
  cca2: string;
}

export default function RegisterForm() {
  const [step, setStep] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [country, setCountry] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    businessType: "",
    fullName: "",
    country: "",
  });

  const handleStep1Submit = async () => {
    const fullNameError = validateField(fullName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password
    );

    if (fullNameError || emailError || passwordError || confirmPasswordError) {
      setErrors({
        ...errors,
        fullName: fullNameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    setStep(2);
  };
  const handleStep2Submit = async () => {};
  const headerContent = {
    1: {
      title: "Créez votre compte",
      description: "Commencez gratuitement en quelques secondes",
    },
    2: {
      title: "Configurez votre entreprise",
      description: "Dernière étape pour accéder à TradeSphere",
    },
  };
  return (
    <FormContainer>
      <FormHeader
        showAsteriskPrompt={true}
        step={step}
        totalSteps={2}
        title={headerContent[step as keyof typeof headerContent].title}
        description={
          headerContent[step as keyof typeof headerContent].description
        }
      />
      <CardContent className="">
        {step === 1 ? (
          <RegisterFormStep1
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            errors={errors}
            isLoading={isLoading}
            handleStep1Submit={handleStep1Submit}
          />
        ) : (
          <RegisterFormStep2
            companyName={companyName}
            setCompanyName={setCompanyName}
            businessType={businessType}
            setBusinessType={setBusinessType}
            country={country}
            setCountry={setCountry}
            countries={countries}
            errors={errors}
            isLoading={isLoading}
            isLoadingCountries={isLoadingCountries}
            handleStep2Submit={handleStep2Submit}
            onBack={() => setStep(1)}
          />
        )}
      </CardContent>
      <CardFooter className="text-center">
        {/* Lien d'inscription */}
        <div className="text-center w-full">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Vous avez déjà un compte ?{" "}
            <Link
              href={getAppRouteName(RouteNames.login)}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </CardFooter>{" "}
    </FormContainer>
  );
}
