import { sendEmail } from "@/lib/email";
import prisma from "../prisma";
import React from "react";
import PasswordEmail from "@/features/auth/components/emails/PasswordEmail";
import { generateRandomPassword, hashPassword } from "@/lib/security";

export async function adminSeed() {
  console.log("Création du superadmin...");

  // Trouver le rôle SUPERADMIN par type
  const superAdminRole = await prisma.role.findFirst({
    where: { type: "SUPERADMIN" },
  });

  if (!superAdminRole) {
    throw new Error("Le rôle SUPERADMIN n'existe pas. Exécutez d'abord seedRoles()");
  }

  // Variables d'environnement pour le superadmin
  const superAdminEmail =  "admin@tradesphere.com";
  const superAdminFullName = "Super Administrateur";

  // Générer un mot de passe aléatoire sécurisé
  const superAdminPassword = generateRandomPassword(); // 16 caractères pour le SuperAdmin
  console.log("Génération d'un mot de passe temporaire...");
  console.log("Mot de passe temporaire généré.", superAdminPassword);

  // Hasher le mot de passe
  const hashedPassword = await hashPassword(superAdminPassword);

  // Vérifier si le superadmin existe déjà
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  // Créer ou mettre à jour l'utilisateur superadmin (inactif jusqu'au changement de mot de passe)
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      password: hashedPassword,
      fullName: superAdminFullName,
      roleId: superAdminRole.id,
      companyId: { set: null },
      isActive: false,
      emailVerifiedAt: null,
      mustChangePassword: true, // Forcer le changement de mot de passe
    },
    create: {
      email: superAdminEmail,
      password: hashedPassword,
      fullName: superAdminFullName,
      roleId: superAdminRole.id,
      isActive: false,
      emailVerifiedAt: null,
      mustChangePassword: true, 
    },
  });

  console.log(existingSuperAdmin ? "Superadmin mis à jour:" : "Superadmin créé:", superAdmin.email);
  console.log("\n" + "=".repeat(80));
  console.log("CONFIGURATION TOTP POUR LE SUPERADMIN");
  console.log("=".repeat(80));
  console.log("\nEmail:", superAdminEmail);
  console.log("Mot de passe temporaire:", superAdminPassword);
  console.log("\n" + "=".repeat(80));
  console.log("Conservez ces informations en lieu sûr !");
  console.log("=".repeat(80) + "\n");

  console.log("Profil de sécurité créé pour le superadmin");

  // Envoyer l'email avec les identifiants
  try {
    console.log("Envoi de l'email avec les identifiants...");
    await sendEmail(
      superAdminEmail,
      "TradeSphere - Vos identifiants de connexion",
      React.createElement(PasswordEmail, {
        fullName: superAdminFullName,
        email: superAdminEmail,
        password: superAdminPassword,
      }),
    );
    console.log("Email envoyé avec succès à:", superAdminEmail);
  } catch (emailError) {
    console.error("Erreur lors de l'envoi de l'email:", emailError);
    console.log("Les identifiants seront affichés dans la console ci-dessous");
  }

  return {
    email: superAdminEmail,
    password: superAdminPassword,
    fullName: superAdminFullName,
  };
}
