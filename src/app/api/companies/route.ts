import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, permissionMiddleware, AuthenticatedRequest } from "@/middleware/auth";
import prisma from "../../../../lib/prisma";

/**
 * GET /api/companies
 * Liste toutes les entreprises (SuperAdmin voit tous, Directeur voit le sien)
 */
export async function GET(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "tenants", "list");
  if (permError) return permError;

  try {
    // SuperAdmin voit toutes les entreprises, Directeur voit seulement la sienne
    const whereClause = user.role?.type === "SUPERADMIN" 
      ? {} 
      : { id: user.companyId };

    const companies = await prisma.company.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            users: true,
            stores: true,
            products: true,
            sales: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: companies,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des entreprises" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies
 * Créer une nouvelle entreprise (Directeur uniquement)
 * Le directeur crée son commerce et y est automatiquement associé
 */
export async function POST(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "tenants", "create");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;

  // Vérifier que l'utilisateur est un DIRECTEUR
  if (user.role?.type !== "DIRECTEUR") {
    return NextResponse.json(
      { error: "Seuls les directeurs peuvent créer un commerce" },
      { status: 403 }
    );
  }

  // Vérifier que le directeur n'a pas déjà un commerce
  if (user.companyId) {
    return NextResponse.json(
      { error: "Vous avez déjà un commerce associé" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const {
      slug: providedSlug,
      companyName,
      businessType,
      country,
      address,
      phone,
      email,
      maxUsers,
      maxStores,
      companyLogo,
    } = body;

    // Générer un slug à partir du nom de l'entreprise si non fourni
    const slug = providedSlug || companyName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Vérifier que le slug est unique
    const existingCompany = await prisma.company.findUnique({
      where: { slug },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé" },
        { status: 400 }
      );
    }

    // Vérifier que le nom de l'entreprise est unique
    const existingCompanyName = await prisma.company.findUnique({
      where: { companyName },
    });

    if (existingCompanyName) {
      return NextResponse.json(
        { error: "Ce nom d'entreprise est déjà utilisé" },
        { status: 400 }
      );
    }

    // Créer l'entreprise et associer le directeur dans une transaction
    const company = await prisma.$transaction(async (tx) => {
      // Créer l'entreprise
      const newCompany = await tx.company.create({
        data: {
          slug,
          companyName,
          businessType,
          country,
          companyAddress: address || undefined,
          companyLogo: companyLogo || undefined,
          maxUsers: maxUsers || 10,
          maxStores: maxStores || 1,
        },
      });

      // Associer le directeur à l'entreprise
      await tx.user.update({
        where: { id: user.id },
        data: { companyId: newCompany.id },
      });

      return newCompany;
    });

    // TODO: Restore AuditLog when model is added back to schema
    // await prisma.auditLog.create({...});

    return NextResponse.json(
      {
        success: true,
        data: company,
        message: "Entreprise créée avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de l'entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'entreprise" },
      { status: 500 }
    );
  }
}
