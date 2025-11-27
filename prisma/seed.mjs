import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data so seeds are repeatable
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  console.log("running seed");

  const shopDomain = "demo-shop.myshopify.com";

  // Seed a couple of products with variants
  await prisma.product.create({
    data: {
      id: "gid://shopify/Product/1",
      shop: shopDomain,
      title: "Red Snowboard",
      handle: "red-snowboard",
      status: "ACTIVE",
      variants: {
        create: [
          {
            id: "gid://shopify/ProductVariant/1-1",
            shop: shopDomain,
            price: "99.99",
            barcode: "RS-001",
            createdAt: new Date(),
          },
          {
            id: "gid://shopify/ProductVariant/1-2",
            shop: shopDomain,
            price: "109.99",
            barcode: "RS-002",
            createdAt: new Date(),
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      id: "gid://shopify/Product/2",
      shop: shopDomain,
      title: "Blue Snowboard",
      handle: "blue-snowboard",
      status: "DRAFT",
      variants: {
        create: [
          {
            id: "gid://shopify/ProductVariant/2-1",
            shop: shopDomain,
            price: "89.99",
            barcode: "BS-001",
            createdAt: new Date(),
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


