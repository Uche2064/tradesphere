import prisma from "../prisma";
import { SubscriptionStatus } from "../../generated/prisma/enums";

export async function seedCompanies() {
  console.log("Création des entreprises (commerces)...");

  const companies = [
    {
      slug: "tech-store",
      companyName: "Tech Store SARL",
      businessType: "Commerce électronique",
      country: "Cameroun",
      companyAddress: "123 Rue de la Technologie, Douala",
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      maxUsers: 10,
      maxStores: 3,
    },
    {
      slug: "fashion-boutique",
      companyName: "Fashion Boutique",
      businessType: "Mode et Vêtements",
      country: "Sénégal",
      companyAddress: "45 Avenue des Champs, Dakar",
      subscriptionStatus: SubscriptionStatus.TRIAL,
      maxUsers: 8,
      maxStores: 1,
    },
  ];

  const createdCompanies = [];

  for (const companyData of companies) {
    const company = await prisma.company.upsert({
      where: { slug: companyData.slug },
      create: companyData,
      update: companyData,
    });
    createdCompanies.push(company);
    console.log(`Entreprise créée: ${company.companyName}`);
  }

  return createdCompanies;
}
