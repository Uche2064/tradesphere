import prisma from "../prisma";
import { RoleType } from "../../generated/prisma/enums";

// Définition des permissions par ressource
const PERMISSIONS = {
  // Gestion des tenants (uniquement SUPERADMIN)
  tenants: ["create", "read", "update", "delete", "list"],

  // Gestion des utilisateurs
  users: ["create", "read", "update", "delete", "list"],

  // Gestion des magasins
  stores: ["create", "read", "update", "delete", "list"],

  // Gestion des produits
  products: ["create", "read", "update", "delete", "list"],

  // Gestion des catégories
  categories: ["create", "read", "update", "delete", "list"],

  // Gestion des stocks
  stocks: ["read", "update", "list", "adjust"],

  // Gestion des ventes
  sales: ["create", "read", "list", "refund"],

  // Statistiques et rapports
  statistics: ["read", "export"],

  // Audit logs
  audit: ["read", "list"],
};

// Mapping des permissions par rôle
const ROLE_PERMISSIONS: Record<RoleType, string[]> = {
  // SuperAdmin : lecture seule pour les tenants, tous les autres droits
  SUPERADMIN: [
    "tenants:read",
    "tenants:list",
    ...PERMISSIONS.users.map((a) => `users:${a}`),
    ...PERMISSIONS.stores.map((a) => `stores:${a}`),
    ...PERMISSIONS.products.map((a) => `products:${a}`),
    ...PERMISSIONS.categories.map((a) => `categories:${a}`),
    ...PERMISSIONS.stocks.map((a) => `stocks:${a}`),
    ...PERMISSIONS.sales.map((a) => `sales:${a}`),
    ...PERMISSIONS.statistics.map((a) => `statistics:${a}`),
    ...PERMISSIONS.audit.map((a) => `audit:${a}`),
  ],

  // Directeur (propriétaire du tenant) - peut créer son propre commerce
  DIRECTEUR: [
    "tenants:create", // Le directeur peut créer son commerce
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "users:list",
    "stores:create",
    "stores:read",
    "stores:update",
    "stores:delete",
    "stores:list",
    "products:create",
    "products:read",
    "products:update",
    "products:delete",
    "products:list",
    "categories:create",
    "categories:read",
    "categories:update",
    "categories:delete",
    "categories:list",
    "stocks:read",
    "stocks:list",
    "stocks:adjust",
    "sales:read",
    "sales:list",
    "sales:refund",
    "statistics:read",
    "statistics:export",
    "audit:read",
    "audit:list",
  ],

  // Gérant (gestionnaire de magasin)
  GERANT: [
    "users:read",
    "users:list",
    "stores:read",
    "products:create",
    "products:read",
    "products:update",
    "products:list",
    "categories:read",
    "categories:list",
    "stocks:read",
    "stocks:list",
    "stocks:adjust",
    "sales:create",
    "sales:read",
    "sales:list",
    "sales:refund",
    "statistics:read",
  ],

  // Vendeur
  VENDEUR: [
    "products:read",
    "products:list",
    "categories:read",
    "categories:list",
    "stocks:read",
    "stocks:list",
    "sales:create",
    "sales:read",
    "sales:list",
  ],

  // Magasinier
  MAGASINIER: [
    "products:read",
    "products:list",
    "categories:read",
    "categories:list",
    "stocks:read",
    "stocks:update",
    "stocks:list",
    "stocks:adjust",
  ],
};

export async function seedPermissions() {
  console.log("Création des permissions...");

  // Créer toutes les permissions
  const permissionsToCreate: Array<{ resource: string; action: string; description: string }> = [];

  Object.entries(PERMISSIONS).forEach(([resource, actions]) => {
    actions.forEach((action) => {
      permissionsToCreate.push({
        resource,
        action,
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
      });
    });
  });

  // Créer toutes les permissions en parallèle
  await Promise.all(
    permissionsToCreate.map((perm) =>
      prisma.permission.upsert({
        where: {
          resource_action: {
            resource: perm.resource,
            action: perm.action,
          },
        },
        create: perm,
        update: perm,
      })
    )
  );

  console.log(`${permissionsToCreate.length} permissions créées`);
}

export async function assignPermissionsToRoles() {
  console.log("Attribution des permissions aux rôles...");

  const roles = await prisma.role.findMany();

  // Récupérer toutes les permissions une seule fois
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = new Map(
    allPermissions.map((p) => [`${p.resource}:${p.action}`, p])
  );

  // Traiter tous les rôles en parallèle
  await Promise.all(
    roles.map(async (role) => {
      const permissions = ROLE_PERMISSIONS[role.type];

      if (!permissions) {
        console.log(`Aucune permission définie pour le rôle ${role.type}`);
        return;
      }

      // Créer les RolePermission par lots pour éviter de surcharger les connexions
      const BATCH_SIZE = 10;
      for (let i = 0; i < permissions.length; i += BATCH_SIZE) {
        const batch = permissions.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (permString) => {
            const permission = permissionMap.get(permString);

            if (!permission) {
              console.log(`Permission ${permString} non trouvée`);
              return;
            }

            await prisma.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: role.id,
                  permissionId: permission.id,
                },
              },
              create: {
                roleId: role.id,
                permissionId: permission.id,
              },
              update: {},
            });
          })
        );
      }

      console.log(`Permissions attribuées au rôle ${role.name} (${permissions.length})`);
    })
  );
}
