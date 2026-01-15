export function validateEmail(value: string): string {
  if (!value) {
    return "L'adresse email est requise";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "Veuillez entrer une adresse email valide";
  }
  return "";
}

export function validatePhone(value: string): string {
  if (!value) {
    return "Le numéro de téléphone est requis";
  }
  const phoneRegex = /^[0-9]+$/;
  if (!phoneRegex.test(value)) {
    return "Veuillez entrer un numéro de téléphone valide";
  }
  return "";
}

export function validatePassword(value: string): string {
  if (!value) {
    return "Le mot de passe est requis";
  }
  if (value.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }
  return "";
}

export function validatePasswordForLogin(value: string): string {
  if (!value) {
    return "Le mot de passe est requis";
  }

  return "";
}

export function validateField(value: string): string {
  if (!value || value.trim() === "") {
    return "Ce champ est requis";
  }
  return "";
}
