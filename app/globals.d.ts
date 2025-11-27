declare module "*.css";
// global shopify server object
declare global {
  interface Window {
    shopify?: any;
  }
}

export {};
