import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  type ShopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopifyConfig = {
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
};

const shopify: ShopifyApp<typeof shopifyConfig> = shopifyApp(shopifyConfig);

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;

export type Authenticate = typeof shopify.authenticate;
export type Unauthenticated = typeof shopify.unauthenticated;
export type Login = typeof shopify.login;
export type RegisterWebhooks = typeof shopify.registerWebhooks;
export type SessionStorage = typeof shopify.sessionStorage;

export const authenticate: Authenticate = shopify.authenticate;
export const unauthenticated: Unauthenticated = shopify.unauthenticated;
export const login: Login = shopify.login;
export const registerWebhooks: RegisterWebhooks = shopify.registerWebhooks;
export const sessionStorage: SessionStorage = shopify.sessionStorage;
