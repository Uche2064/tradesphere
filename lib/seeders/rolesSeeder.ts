import { Role } from "../../generated/prisma/browser";
import { RoleType } from "../../generated/prisma/enums";
import prisma from "../prisma";

export async function rolesSeeder() {
  console.log("Création des rôles...");

  const roles = [
    {
      name: "SuperAdmin",
      type: RoleType.SUPERADMIN,
      description: "Administrateur système avec tous les droits",
    },
    {
      name: "Directeur",
      type: RoleType.DIRECTEUR,
      description: "Directeur d'entreprise avec gestion complète",
    },
    {
      name: "Gérant",
      type: RoleType.GERANT,
      description: "Gérant de magasin avec droits de gestion",
    },
    {
      name: "Vendeur",
      type: RoleType.VENDEUR,
      description: "Vendeur avec droits de vente",
    },
    {
      name: "Magasinier",
      type: RoleType.MAGASINIER,
      description: "Magasinier avec gestion des stocks",
    },
  ];

  const createdRoles: Record<string, Role> = {};

  for (const roleData of roles) {
    let role = await prisma.role.findFirst({
      where: { type: roleData.type },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleData.name,
          type: roleData.type,
          description: roleData.description,
        },
      });
      console.log(`Rôle ${roleData.name} créé`);
    } else {
      // Mettre à jour le rôle existant si nécessaire
      role = await prisma.role.update({
        where: { id: role.id },
        data: {
          name: roleData.name,
          description: roleData.description,
        },
      });
      console.log(`Rôle ${roleData.name} mis à jour`);
    }

    createdRoles[roleData.type] = role;
  }

  console.log("Tous les rôles sont prêts");
  return createdRoles;
}
