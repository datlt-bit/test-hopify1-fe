/// <reference types="vite/client" />
/// <reference types="@react-router/node" />

declare module "*.graphql?raw" {
  const value: string;
  export default value;
}

