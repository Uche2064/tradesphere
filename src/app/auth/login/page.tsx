import type { Metadata } from "next";
import LoginForm from "@/features/auth/forms/login/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte TradeSphere",
};

export default function LoginPage() {
  return (
    <LoginForm />
  );
}
