import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRouteError, Link } from "react-router";

import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticateWithLogging } from "@/utils/auth.server";
import productQuery from "./product.graphql?raw";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticateWithLogging(request);
  const { id } = params;

  const response = await admin.graphql(productQuery, {
    variables: {
      id: `gid://shopify/Product/${id}`,
    },
  });

  const data = await response.json();
  const product = data?.data?.product;

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  // Normalize variants
  const variantEdges = product.variants?.edges ?? [];
  const variants = variantEdges.map((edge: any) => edge.node);

  // Normalize media/images
  const mediaEdges = product.media?.edges ?? [];
  const images = mediaEdges
    .filter((edge: any) => edge.node?.image)
    .map((edge: any) => edge.node.image);

  return {
    product: {
      ...product,
      variants,
      images,
    },
  };
};

export default function ProductPage() {
  const data = useLoaderData<typeof loader>();
  console.log("[ProductPage] Rendering with data:", data);
  
  if (!data || !data.product) {
    console.log("[ProductPage] No product data!");
    return <s-page heading="Loading..."><s-section><s-text>Loading product...</s-text></s-section></s-page>;
  }
  
  const { product } = data;

  return (
    <s-page heading={product.title}>
      <s-section>
        <Link to="/app/products" style={{ textDecoration: "none", color: "inherit" }}>
          ← Back to Products
        </Link>
      </s-section>

      <s-section heading="Product Details">
        <s-stack direction="inline" gap="large">
          {product.featuredMedia?.preview?.image?.url && (
            <img
              src={product.featuredMedia.preview.image.url}
              alt={product.featuredMedia.preview.image.altText || product.title}
              style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "8px" }}
            />
          )}
          <s-stack direction="block" gap="base">
            <s-text>
              <strong>Handle:</strong> {product.handle}
            </s-text>
            <s-text>
              <strong>Status:</strong> {product.status}
            </s-text>
            {product.vendor && (
              <s-text>
                <strong>Vendor:</strong> {product.vendor}
              </s-text>
            )}
            {product.productType && (
              <s-text>
                <strong>Product Type:</strong> {product.productType}
              </s-text>
            )}
            <s-text>
              <strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString()}
            </s-text>
            <s-text>
              <strong>Updated:</strong> {new Date(product.updatedAt).toLocaleDateString()}
            </s-text>
          </s-stack>
        </s-stack>
      </s-section>

      {product.description && (
        <s-section heading="Description">
          <s-paragraph>{product.description}</s-paragraph>
        </s-section>
      )}

      {product.images.length > 0 && (
        <s-section heading="Images">
          <s-stack direction="inline" gap="base">
            {product.images.map((image: any, index: number) => (
              <img
                key={index}
                src={image.url}
                alt={image.altText || `Product image ${index + 1}`}
                style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px" }}
              />
            ))}
          </s-stack>
        </s-section>
      )}

      <s-section heading="Variants">
        {product.variants.length === 0 ? (
          <s-paragraph>No variants for this product.</s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {product.variants.map((variant: any) => (
              <s-box
                key={variant.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <s-stack direction="block" gap="none">
                  <s-text>
                    <strong>{variant.title}</strong>
                  </s-text>
                  <s-text>Price: {variant.price ?? "N/A"}</s-text>
                  {variant.sku && <s-text>SKU: {variant.sku}</s-text>}
                  {variant.barcode && <s-text>Barcode: {variant.barcode}</s-text>}
                  {variant.inventoryQuantity !== null && (
                    <s-text>Inventory: {variant.inventoryQuantity}</s-text>
                  )}
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

