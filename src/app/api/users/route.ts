import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, permissionMiddleware, AuthenticatedRequest } from "@/middleware/auth";
import prisma from "../../../../lib/prisma";
import { RoleType } from "../../../../generated/prisma/enums";
import { hashPassword, generateRandomPassword } from "@/lib/security";

/**
 * GET /api/users
 * Liste uniquement les DIRECTEURS (SuperAdmin uniquement, lecture seule)
 */
export async function GET(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "users", "list");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;

  try {
    // Seul le SuperAdmin peut voir les directeurs
    if (user.role?.type !== RoleType.SUPERADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer le rôle DIRECTEUR
    const directeurRole = await prisma.role.findFirst({
      where: { type: RoleType.DIRECTEUR },
    });

    if (!directeurRole) {
      return NextResponse.json(
        { error: "Rôle Directeur non trouvé" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const companyId = searchParams.get("companyId") || undefined;
    const skip = (page - 1) * limit;

    const whereClause: {
      roleId: string;
      companyId?: string;
      OR?: Array<{
        fullName?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      roleId: directeurRole.id, // Filtrer uniquement les DIRECTEURS
    };

    if (companyId) {
      whereClause.companyId = companyId;
    }

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          role: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          company: {
            select: {
              id: true,
              companyName: true,
              slug: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Créer un nouveau membre de l'équipe (Directeur uniquement)
 * Le directeur peut créer GERANT, VENDEUR, MAGASINIER uniquement
 */
export async function POST(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "users", "create");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;

  // Vérifier que l'utilisateur a une entreprise (doit être DIRECTEUR)
  if (!user.companyId) {
    return NextResponse.json(
      { error: "Vous devez avoir un commerce avant de créer des membres d'équipe" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { email, fullName, phone, roleType, storeId, password: providedPassword } = body;

    // Validation des champs requis
    if (!email || !fullName || !roleType) {
      return NextResponse.json(
        { error: "L'email, le nom complet et le rôle sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Vérifier que le rôle est autorisé (GERANT, VENDEUR, MAGASINIER uniquement)
    const allowedRoles = [RoleType.GERANT, RoleType.VENDEUR, RoleType.MAGASINIER];
    if (!allowedRoles.includes(roleType)) {
      return NextResponse.json(
        { 
          error: `Vous ne pouvez créer que des membres avec les rôles : ${allowedRoles.join(", ")}` 
        },
        { status: 400 }
      );
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Récupérer le rôle correspondant
    const role = await prisma.role.findFirst({
      where: { type: roleType },
    });

    if (!role) {
      return NextResponse.json(
        { error: `Rôle ${roleType} non trouvé` },
        { status: 404 }
      );
    }

    // Si storeId fourni, vérifier qu'il appartient à l'entreprise du directeur
    if (storeId) {
      const store = await prisma.store.findFirst({
        where: { 
          id: storeId,
          companyId: user.companyId,
        },
      });

      if (!store) {
        return NextResponse.json(
          { error: "Magasin non trouvé ou n'appartient pas à votre entreprise" },
          { status: 400 }
        );
      }
    }

    // Vérifier la limite d'utilisateurs (maxUsers)
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { maxUsers: true, _count: { select: { users: true } } },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    if (company._count.users >= company.maxUsers) {
      return NextResponse.json(
        { 
          error: `Vous avez atteint la limite de ${company.maxUsers} utilisateur(s) autorisé(s) pour votre abonnement` 
        },
        { status: 400 }
      );
    }

    // Générer un mot de passe temporaire si non fourni
    const temporaryPassword = providedPassword || generateRandomPassword(12);
    const hashedPassword = await hashPassword(temporaryPassword);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone: phone || undefined,
        roleId: role.id,
        companyId: user.companyId,
        storeId: storeId || undefined,
        isActive: false, // Inactif jusqu'au changement de mot de passe
        emailVerifiedAt: null,
        mustChangePassword: true, // Forcer le changement de mot de passe
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        store: storeId ? {
          select: {
            id: true,
            name: true,
          },
        } : undefined,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "user.created",
        resource: "user",
        resourceId: newUser.id,
        details: JSON.stringify({ email, fullName, roleType }),
        userId: user.id,
        companyId: user.companyId,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newUser,
          // Ne pas renvoyer le mot de passe, mais inclure le mot de passe temporaire si généré
          password: undefined,
          temporaryPassword: providedPassword ? undefined : temporaryPassword,
        },
        message: `Membre d'équipe créé avec succès${providedPassword ? "" : ". Un mot de passe temporaire a été généré."}`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    
    // Gérer les erreurs Prisma spécifiques
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
