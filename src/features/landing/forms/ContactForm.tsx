"use client";

import AppInput from "@/lib/shared/components/AppInput";
import { Button } from "@/lib/components/ui/button";

import { Textarea } from "@/lib/components/ui/textarea";
import { Loader2, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { validateEmail, validateField } from "@/lib/validators";

export default function ContactMeForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetFields = () => {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setErrors({ name: "", email: "", message: "" });
  };
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const nameError = validateField(name);
      const emailError = validateEmail(email);
      const messageError = validateField(message);
      setErrors({ name: nameError, email: emailError, message: messageError });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error("Une erreur est survenue lors de l'envoi de l'email");
      }
      console.error("error", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-4 sm:grid-cols-2">
          <AppInput
            id="name"
            label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
            leadingIcon={User}
            error={errors.name}
            disabled={isLoading}
            required={true}
            className="sm:col-span-1"
          />
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
            required={true}
            className="sm:col-span-1"
          />
          <AppInput
            id="phone"
            label="Téléphone"
            type="tel"
            placeholder="Votre téléphone"
            value={phone}
            leadingIcon={Phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
            className="sm:col-span-2"
          />
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-foreground dark:text-white">
              Message <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Parlez brièvement de votre besoin..."
              value={message}
              className="min-h-[140px] resize-none"
              disabled={isLoading}
              rows={4}
              onChange={(e) => setMessage(e.target.value)}
            />
            {errors.message && (
              <p className="text-red-500 text-sm">{errors.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            onClick={handleSubmit}
            type="submit"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );
}
