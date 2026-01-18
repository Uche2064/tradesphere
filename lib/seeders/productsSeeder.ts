import prisma from "../prisma";
import type { Company, Store } from "../../generated/prisma/client";

export async function seedProducts(companies: Company[], stores: Store[]) {
  console.log("Création des produits...");

  // Catégories pour Tech Store
  const techCategories = [
    {
      name: "Ordinateurs",
      slug: "ordinateurs",
      description: "Ordinateurs portables et de bureau",
      companyId: companies[0].id,
    },
    {
      name: "Smartphones",
      slug: "smartphones",
      description: "Téléphones intelligents",
      companyId: companies[0].id,
    },
    {
      name: "Accessoires",
      slug: "accessoires",
      description: "Accessoires électroniques",
      companyId: companies[0].id,
    },
  ];

  // Créer toutes les catégories en parallèle
  const createdCategories = await Promise.all(
    techCategories.map((cat) =>
      prisma.category.upsert({
        where: {
          companyId_slug: {
            companyId: cat.companyId,
            slug: cat.slug,
          },
        },
        create: cat,
        update: cat,
      })
    )
  );

  console.log(`${createdCategories.length} catégories créées`);

  // Produits pour Tech Store
  const products = [
    {
      sku: "LAP-001",
      name: "Dell Latitude 5520",
      description: "Ordinateur portable professionnel Intel Core i5, 8GB RAM, 256GB SSD",
      purchasePrice: 450000,
      sellingPrice: 650000,
      taxRate: 19.25,
      categoryId: createdCategories[0].id,
      companyId: companies[0].id,
    },
    {
      sku: "LAP-002",
      name: "HP EliteBook 840",
      description: "Ordinateur portable Intel Core i7, 16GB RAM, 512GB SSD",
      purchasePrice: 650000,
      sellingPrice: 900000,
      taxRate: 19.25,
      categoryId: createdCategories[0].id,
      companyId: companies[0].id,
    },
    {
      sku: "PHO-001",
      name: "Samsung Galaxy S23",
      description: "Smartphone Samsung Galaxy S23 128GB",
      purchasePrice: 380000,
      sellingPrice: 550000,
      taxRate: 19.25,
      categoryId: createdCategories[1].id,
      companyId: companies[0].id,
    },
    {
      sku: "PHO-002",
      name: "iPhone 14 Pro",
      description: "Apple iPhone 14 Pro 256GB",
      purchasePrice: 650000,
      sellingPrice: 950000,
      taxRate: 19.25,
      categoryId: createdCategories[1].id,
      companyId: companies[0].id,
    },
    {
      sku: "ACC-001",
      name: "Souris sans fil Logitech",
      description: "Souris sans fil ergonomique",
      purchasePrice: 8000,
      sellingPrice: 15000,
      taxRate: 19.25,
      categoryId: createdCategories[2].id,
      companyId: companies[0].id,
    },
    {
      sku: "ACC-002",
      name: "Clavier mécanique",
      description: "Clavier mécanique rétroéclairé RGB",
      purchasePrice: 25000,
      sellingPrice: 45000,
      taxRate: 19.25,
      categoryId: createdCategories[2].id,
      companyId: companies[0].id,
    },
  ];

  // Vérifier qu'on a au moins un magasin pour créer les stocks
  if (!stores || stores.length === 0) {
    throw new Error("Aucun magasin disponible pour créer les stocks des produits");
  }

  // Créer les produits avec leurs stocks initiaux dans des transactions atomiques
  // Utiliser des lots de 3 pour réduire la pression sur le pool
  const BATCH_SIZE = 3;
  const createdProducts = [];

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (prod) => {
        // Générer une quantité aléatoire pour le stock initial
        const initialQuantity = Math.floor(Math.random() * 50) + 10; // Entre 10 et 60

        // Créer le produit ET son stock initial dans une transaction atomique
        return await prisma.$transaction(async (tx) => {
          // Créer ou mettre à jour le produit
          const product = await tx.product.upsert({
            where: {
              companyId_sku: {
                companyId: prod.companyId,
                sku: prod.sku,
              },
            },
            create: prod,
            update: prod,
          });

          // Créer automatiquement le stock initial dans le premier magasin de l'entreprise
          // (ou le magasin correspondant à l'entreprise du produit)
          const storeForProduct = stores.find((s) => s.companyId === prod.companyId) || stores[0];

          await tx.stock.upsert({
            where: {
              productId_storeId: {
                productId: product.id,
                storeId: storeForProduct.id,
              },
            },
            create: {
              productId: product.id,
              storeId: storeForProduct.id,
              quantity: initialQuantity,
              minQuantity: 5,
              maxQuantity: 100,
            },
            update: {
              // Si le stock existe déjà, maintenir les valeurs existantes
            },
          });

          return product;
        });
      })
    );
    createdProducts.push(...batchResults);
  }

  console.log(`${createdProducts.length} produits créés avec stocks`);

  return { products: createdProducts, categories: createdCategories };
}
