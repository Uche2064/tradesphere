import prisma from "./prisma";
import { rolesSeeder } from "./seeders/rolesSeeder";
import { seedPermissions, assignPermissionsToRoles } from "./seeders/permissionsSeeder";
import { seedCompanies } from "./seeders/companiesSeeder";
import { seedUsers } from "./seeders/usersSeeder";
import { seedProducts } from "./seeders/productsSeeder";
import { adminSeed } from "./seeders/adminSeeder";

async function main() {
  console.log("Démarrage du processus de seed...");
  console.log("==================================================");

  try {
    // 1. Créer les rôles
    await rolesSeeder();

    // 2. Créer les permissions
    await seedPermissions();

    // 3. Créer le superadmin
    await adminSeed();

    // 3. Attribuer les permissions aux rôles
    await assignPermissionsToRoles();

    // 4. Créer les entreprises (commerces)
    const companies = await seedCompanies();

    // 5. Créer les utilisateurs (SuperAdmin, Directeurs, Gérants, Vendeurs, Magasiniers)
    const { stores } = await seedUsers(companies);

    // 6. Créer les produits et catégories
    await seedProducts(companies, stores);

    
  } catch (error) {
    console.error("Erreur lors du seed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Erreur fatale:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
