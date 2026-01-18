import type { Metadata } from "next";
import RegisterForm from "@/features/auth/forms/register/RegisterForm";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte TradeSphere",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
