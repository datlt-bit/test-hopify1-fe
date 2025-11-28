import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `
      query ProductsWithVariants($first: Int!, $variantsFirst: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              status
              variants(first: $variantsFirst) {
                edges {
                  node {
                    id
                    price
                    barcode
                    createdAt
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        first: 50,
        variantsFirst: 50,
      },
    },
  );

  const data = await response.json();
  const edges = data?.data?.products?.edges ?? [];

  // Normalize GraphQL shape into the simple structure expected by the UI:
  // `product.variants` as a flat array of variant nodes.
  const products = edges.map((edge: any) => {
    const product = edge.node;
    const variantEdges = product.variants?.edges ?? [];
    const variants = variantEdges.map((vEdge: any) => vEdge.node);

    return {
      ...product,
      variants,
    };
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


