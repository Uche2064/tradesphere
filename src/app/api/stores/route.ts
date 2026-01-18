import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, permissionMiddleware, AuthenticatedRequest } from "@/middleware/auth";
import prisma from "../../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";

/**
 * GET /api/stores
 * Liste tous les magasins (SuperAdmin voit tous, Directeur voit ceux de son entreprise)
 */
export async function GET(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "stores", "list");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const companyId = searchParams.get("companyId") || user.companyId || undefined;
    const skip = (page - 1) * limit;

    const whereClause: {
      companyId?: string;
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        slug?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

    // SuperAdmin peut voir tous les magasins, sinon filtrer par entreprise
    if (user?.role?.type === "SUPERADMIN") {
      if (companyId) {
        whereClause.companyId = companyId;
      }
    } else {
      whereClause.companyId = user.companyId;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where: whereClause,
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              slug: true,
            },
          },
          _count: {
            select: {
              users: true,
              stocks: true,
              sales: true,
              stockMovements: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.store.count({ where: whereClause }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: stores,
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
    console.error("Erreur lors de la récupération des magasins:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des magasins" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stores
 * Créer un nouveau magasin (Directeur uniquement)
 */
export async function POST(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "stores", "create");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;

  // Vérifier que l'utilisateur a une entreprise (doit être DIRECTEUR avec companyId)
  if (!user.companyId) {
    return NextResponse.json(
      { error: "Vous devez avoir un commerce avant de créer un magasin" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { name, slug: providedSlug, address, phone, email } = body;

    // Validation des champs requis
    if (!name) {
      return NextResponse.json(
        { error: "Le nom du magasin est requis" },
        { status: 400 }
      );
    }

    // Générer un slug à partir du nom si non fourni
    const slug = providedSlug || name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (!slug) {
      return NextResponse.json(
        { error: "Impossible de générer un slug valide à partir du nom" },
        { status: 400 }
      );
    }

    // Vérifier que le slug est unique dans l'entreprise (contrainte @@unique([companyId, slug]))
    const existingStore = await prisma.store.findUnique({
      where: {
        companyId_slug: {
          companyId: user.companyId,
          slug,
        },
      },
    });

    if (existingStore) {
      return NextResponse.json(
        { error: `Un magasin avec le slug "${slug}" existe déjà dans votre entreprise` },
        { status: 400 }
      );
    }

    // Vérifier la limite de magasins (maxStores)
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { maxStores: true, _count: { select: { stores: true } } },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    if (company._count.stores >= company.maxStores) {
      return NextResponse.json(
        { 
          error: `Vous avez atteint la limite de ${company.maxStores} magasin(s) autorisé(s) pour votre abonnement` 
        },
        { status: 400 }
      );
    }

    // Créer le magasin
    const store = await prisma.store.create({
      data: {
        name,
        slug,
        address: address || undefined,
        phone: phone || undefined,
        email: email || undefined,
        companyId: user.companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            slug: true,
          },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "store.created",
        resource: "store",
        resourceId: store.id,
        details: JSON.stringify({ name, slug }),
        userId: user.id,
        companyId: user.companyId,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: store,
        message: "Magasin créé avec succès",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erreur lors de la création du magasin:", error);
    
    // Gérer les erreurs Prisma spécifiques
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé dans votre entreprise" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du magasin" },
      { status: 500 }
    );
  }
}
