import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { boundary } from "@shopify/shopify-app-react-router/server";

// Original authentication logic (commented out to remove login requirement):
// import { authenticate } from "../../shopify.server";
import prisma from "../../db.server";

export const loader = async (_args: LoaderFunctionArgs) => {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return { products };
};

export default function ProductsPage() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Products in local database">
      <s-section heading="Products and variants">
        {products.length === 0 ? (
          <s-paragraph>No products found. Seed the database first.</s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {products.map((product: any) => (
              <s-box
                key={product.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <s-heading>{product.title}</s-heading>
                <s-text>Shop: {product.shop}</s-text>
                {product.handle && <s-text>Handle: {product.handle}</s-text>}
                <s-text>Status: {product.status ?? "Unknown"}</s-text>

                <s-heading>Variants</s-heading>
                {product.variants.length === 0 ? (
                  <s-paragraph>No variants for this product.</s-paragraph>
                ) : (
                    <s-unordered-list>
                    {product.variants.map((variant: any) => (
                      <s-list-item key={variant.id}>
                        <s-text>
                          ID: {variant.id} — Price: {variant.price ?? "N/A"} —
                          Barcode: {variant.barcode ?? "N/A"}
                        </s-text>
                      </s-list-item>
                    ))}
                  </s-unordered-list>
                )}
              </s-box>
            ))}
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};


