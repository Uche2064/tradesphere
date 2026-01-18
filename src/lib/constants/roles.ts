// Temporary RoleType constants until Prisma schema is restored with RoleType enum
export const RoleType = {
  SUPERADMIN: "SUPERADMIN",
  DIRECTEUR: "DIRECTEUR",
  GERANT: "GERANT",
  VENDEUR: "VENDEUR",
  MAGASINIER: "MAGASINIER",
} as const;

export type RoleType = (typeof RoleType)[keyof typeof RoleType];

// SubscriptionStatus constants
export const SubscriptionStatus = {
  TRIAL: "TRIAL",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;

export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
