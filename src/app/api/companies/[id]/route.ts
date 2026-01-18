import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, permissionMiddleware, AuthenticatedRequest } from "@/middleware/auth";
import prisma from "../../../../../lib/prisma";
import { RoleType } from "../../../../../generated/prisma/enums";

/**
 * GET /api/companies/:id
 * Récupérer une entreprise spécifique avec son directeur
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "tenants", "read");
  if (permError) return permError;

  try {
    const { id } = await params;
    
    // Récupérer le rôle DIRECTEUR
    const directeurRole = await prisma.role.findFirst({
      where: { type: RoleType.DIRECTEUR },
    });

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            stores: true,
            products: true,
            sales: true,
          },
        },
        // Récupérer le directeur de l'entreprise
        users: directeurRole ? {
          where: {
            roleId: directeurRole.id,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
          },
          take: 1,
        } : false,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    // Formatter les données pour inclure le directeur
    const companyData = {
      ...company,
      director: company.users && company.users.length > 0 ? company.users[0] : null,
      users: undefined, // Retirer users pour éviter la confusion
    };

    return NextResponse.json(
      {
        success: true,
        data: companyData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de l'entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'entreprise" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/companies/:id
 * Mettre à jour une entreprise
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "tenants", "update");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;

  try {
    const { id } = await params;
    const body = await req.json();

    const company = await prisma.company.update({
      where: { id },
      data: body,
    });

    // TODO: Restore AuditLog when model is added back to schema
    // await prisma.auditLog.create({...});

    return NextResponse.json(
      {
        success: true,
        data: company,
        message: "Entreprise mise à jour avec succès",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'entreprise" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/companies/:id
 * Supprimer une entreprise (SuperAdmin uniquement)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "tenants", "delete");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;

  try {
    const { id } = await params;
    // Vérifier que l'entreprise existe
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer l'entreprise (cascade sur toutes les données associées)
    await prisma.company.delete({
      where: { id },
    });

    // TODO: Restore AuditLog when model is added back to schema
    // await prisma.auditLog.create({...});

    return NextResponse.json(
      {
        success: true,
        message: "Entreprise supprimée avec succès",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'entreprise" },
      { status: 500 }
    );
  }
}
