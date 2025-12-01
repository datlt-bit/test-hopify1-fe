import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link } from "react-router";

import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticateWithLogging } from "../../utils/auth.server";
import productsQuery from "../../graphql/productList.graphql?raw";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticateWithLogging(request);

  const response = await admin.graphql(productsQuery);

  const data = await response.json();
  const nodes = data?.data?.products?.nodes ?? [];
  const products = nodes.map((product: any) => {
    const mediaNodes = product.media?.nodes ?? [];
    const primaryMediaImage =
      mediaNodes.find((node: any) => node.__typename === "MediaImage") ?? null;

    return {
      ...product,
      variants: product.variants ?? [],
      primaryImage: primaryMediaImage?.image ?? null,
    };
  });

  return { products };
};

export default function ProductsPage() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Products in local database">
      <s-section heading="Products and variants - local and on shopify">
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
                <s-stack direction="inline" gap="base">
                  {product.primaryImage?.url && (
                    <img
                      src={product.primaryImage.url}
                      alt={product.primaryImage.altText || product.title}
                      style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }}
                    />
                  )}
                  <s-stack direction="block" gap="none">
                    <Link
                      to={`/app/product/${product.id.replace("gid://shopify/Product/", "")}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <s-heading>{product.title}</s-heading>
                    </Link>
                    <s-text>Shop: {product.shop}</s-text>
                    {product.handle && <s-text>Handle: {product.handle}</s-text>}
                    <s-text>Status: {product.status ?? "Unknown"}</s-text>
                  </s-stack>
                </s-stack>

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


