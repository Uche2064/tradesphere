import prisma from "../prisma";
import { hashPassword } from "../../src/lib/security";
import { RoleType } from "../../generated/prisma/enums";
import type { Company } from "../../generated/prisma/client";

export async function seedUsers(companies: Company[]) {
  // Récupérer les rôles
  const roles = await prisma.role.findMany();
  const getRoleByType = (type: RoleType) => roles.find((r) => r.type === type)!;

  // Hasher tous les mots de passe en parallèle
  const [directeurPassword, gerantPassword, vendeurPassword, magasinierPassword] = await Promise.all([
    hashPassword("Directeur@2024"),
    hashPassword("Gerant@2024"),
    hashPassword("Vendeur@2024"),
    hashPassword("Magasinier@2024"),
  ]);

  // 2. Directeur pour Tech Store
  // Même logique que adminSeeder : compte inactif jusqu'au changement de mot de passe
  const directeur1 = await prisma.user.upsert({
    where: { email: "directeur@techstore.cm" },
    update: {
      password: directeurPassword,
      fullName: "Jean Dupont",
      phone: "+237 677 111 111",
      roleId: getRoleByType(RoleType.DIRECTEUR).id,
      companyId: companies[0].id,
      isActive: false,
      emailVerifiedAt: null,
      mustChangePassword: true, // Forcer le changement de mot de passe
    },
    create: {
      email: "directeur@techstore.cm",
      password: directeurPassword,
      fullName: "Jean Dupont",
      phone: "+237 677 111 111",
      roleId: getRoleByType(RoleType.DIRECTEUR).id,
      companyId: companies[0].id,
      isActive: false,
      emailVerifiedAt: null,
      mustChangePassword: true,
    },
  });

  // 3. Directeur pour Fashion Boutique
  // Créer les deux directeurs et les deux magasins en parallèle
  const [directeur2, store1, store2] = await Promise.all([
    prisma.user.upsert({
      where: { email: "directeur@fashionboutique.sn" },
      update: {
        password: directeurPassword,
        fullName: "Marie Martin",
        phone: "+221 77 222 222",
        roleId: getRoleByType(RoleType.DIRECTEUR).id,
        companyId: companies[1].id,
        isActive: false,
        emailVerifiedAt: null,
        mustChangePassword: true,
      },
      create: {
        email: "directeur@fashionboutique.sn",
        password: directeurPassword,
        fullName: "Marie Martin",
        phone: "+221 77 222 222",
        roleId: getRoleByType(RoleType.DIRECTEUR).id,
        companyId: companies[1].id,
        isActive: false,
        emailVerifiedAt: null,
        mustChangePassword: true,
      },
    }),

    // 4. Créer des magasins en parallèle
    prisma.store.upsert({
    where: {
      companyId_slug: {
        companyId: companies[0].id,
        slug: "douala-centre",
      },
    },
    create: {
      name: "Tech Store Douala Centre",
      slug: "douala-centre",
      address: "123 Rue de la Technologie, Douala",
      phone: "+237 677 123 456",
      companyId: companies[0].id,
    },
      update: {},
    }),

    prisma.store.upsert({
      where: {
        companyId_slug: {
          companyId: companies[1].id,
          slug: "dakar-plateau",
        },
      },
      create: {
        name: "Fashion Boutique Plateau",
        slug: "dakar-plateau",
        address: "45 Avenue des Champs, Dakar",
        phone: "+221 77 234 567",
        companyId: companies[1].id,
      },
      update: {},
    }),
  ]);

  // 5. Créer tous les autres utilisateurs en parallèle
  // Pour les autres rôles (GERANT, VENDEUR, MAGASINIER), même logique d'authentification
  const [gerant1, vendeur1, magasinier1] = await Promise.all([
    prisma.user.upsert({
    where: { email: "gerant@techstore.cm" },
    update: {
      password: gerantPassword,
      fullName: "Paul Dubois",
      phone: "+237 677 333 333",
      roleId: getRoleByType(RoleType.GERANT).id,
      companyId: companies[0].id,
      storeId: store1.id,
      isActive: false,
      emailVerifiedAt: null,
      mustChangePassword: true, // Forcer le changement de mot de passe
    },
    create: {
      email: "gerant@techstore.cm",
      password: gerantPassword,
      fullName: "Paul Dubois",
      phone: "+237 677 333 333",
      roleId: getRoleByType(RoleType.GERANT).id,
      companyId: companies[0].id,
      storeId: store1.id,
      isActive: false,
      emailVerifiedAt: null,
      mustChangePassword: true,
      },
    }),

    // 6. Vendeur
    prisma.user.upsert({
      where: { email: "vendeur1@techstore.cm" },
      update: {
        password: vendeurPassword,
        fullName: "Sophie Laurent",
        phone: "+237 677 444 444",
        roleId: getRoleByType(RoleType.VENDEUR).id,
        companyId: companies[0].id,
        storeId: store1.id,
        isActive: false,
        emailVerifiedAt: null,
        mustChangePassword: true,
      },
      create: {
        email: "vendeur1@techstore.cm",
        password: vendeurPassword,
        fullName: "Sophie Laurent",
        phone: "+237 677 444 444",
        roleId: getRoleByType(RoleType.VENDEUR).id,
        companyId: companies[0].id,
        storeId: store1.id,
        isActive: false,
        emailVerifiedAt: null,
        mustChangePassword: true,
      },
    }),

    // 7. Magasinier
    prisma.user.upsert({
      where: { email: "magasinier@techstore.cm" },
      update: {
        password: magasinierPassword,
        fullName: "Luc Bernard",
        phone: "+237 677 555 555",
        roleId: getRoleByType(RoleType.MAGASINIER).id,
        companyId: companies[0].id,
        storeId: store1.id,
        isActive: false,
        emailVerifiedAt: null,
        mustChangePassword: true, // Forcer le changement de mot de passe
      },
      create: {
        email: "magasinier@techstore.cm",
        password: magasinierPassword,
        fullName: "Luc Bernard",
        phone: "+237 677 555 555",
        roleId: getRoleByType(RoleType.MAGASINIER).id,
        companyId: companies[0].id,
        storeId: store1.id,
        isActive: false,
        emailVerifiedAt: null,
        mustChangePassword: true,
      },
    }),
  ]);

  return {
    directeurs: [directeur1, directeur2],
    gerants: [gerant1],
    vendeurs: [vendeur1],
    magasiniers: [magasinier1],
    stores: [store1, store2],
  };
}
