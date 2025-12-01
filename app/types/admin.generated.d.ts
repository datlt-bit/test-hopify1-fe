/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type PopulateProductMutationVariables = AdminTypes.Exact<{
  product: AdminTypes.ProductCreateInput;
}>;


export type PopulateProductMutation = { productCreate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status'>
      & { variants: { edges: Array<{ node: Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'barcode' | 'createdAt'> }> } }
    )> }> };

export type ProductQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type ProductQuery = { products: { nodes: Array<(
      Pick<AdminTypes.Product, 'id' | 'title'>
      & { category?: AdminTypes.Maybe<Pick<AdminTypes.TaxonomyCategory, 'id' | 'fullName'>>, media: { nodes: Array<{ __typename: 'ExternalVideo' | 'Model3d' | 'Video' } | (
          { __typename: 'MediaImage' }
          & Pick<AdminTypes.MediaImage, 'id'>
          & { image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'altText'>> }
        )> } }
    )> } };

export type ShopifyReactRouterTemplateUpdateVariantMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars['ID']['input'];
  variants: Array<AdminTypes.ProductVariantsBulkInput> | AdminTypes.ProductVariantsBulkInput;
}>;


export type ShopifyReactRouterTemplateUpdateVariantMutation = { productVariantsBulkUpdate?: AdminTypes.Maybe<{ productVariants?: AdminTypes.Maybe<Array<Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'barcode' | 'createdAt'>>> }> };

interface GeneratedQueryTypes {
  "query product {\n  products(first: 100) {\n    nodes {\n      id\n      title\n      category {\n        id\n        fullName\n      }\n      media(first: 10) {\n        nodes {\n          __typename\n          ... on MediaImage {\n            id\n            image {\n              url\n              altText\n            }\n          }\n        }\n      }\n    }\n  }\n}": {return: ProductQuery, variables: ProductQueryVariables},
}

interface GeneratedMutationTypes {
  "mutation populateProduct($product: ProductCreateInput!) {\n  productCreate(product: $product) {\n    product {\n      id\n      title\n      handle\n      status\n      variants(first: 10) {\n        edges {\n          node {\n            id\n            price\n            barcode\n            createdAt\n          }\n        }\n      }\n    }\n  }\n}": {return: PopulateProductMutation, variables: PopulateProductMutationVariables},
  "mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {\n  productVariantsBulkUpdate(productId: $productId, variants: $variants) {\n    productVariants {\n      id\n      price\n      barcode\n      createdAt\n    }\n  }\n}": {return: ShopifyReactRouterTemplateUpdateVariantMutation, variables: ShopifyReactRouterTemplateUpdateVariantMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
