## Project Guide: test-hopify1-fe

This project is a **Shopify embedded app** built with **React Router**, **Shopify’s React Router SDK**, and **Prisma** for session storage.
It’s based on Shopify’s official React Router app template and wired to use the Shopify CLI and TOML configs in the root.

---

## 1. Tech Stack & Key Dependencies

- **Runtime & tooling**
  - **React Router v7** for routing and data loading (`loader`/`action`).
  - **React 18** for UI.
  - **Vite** for local frontend tooling (via React Router dev server).
  - **TypeScript** for type safety.
- **Shopify integration**
  - `@shopify/shopify-app-react-router`: server & React helpers for auth, session, and webhooks.
  - `@shopify/app-bridge-react`: App Bridge hooks (`useAppBridge`) for embedded app UI and intents.
  - Shopify CLI + `shopify.app.toml` / `shopify.web.toml` for app configuration and dev/deploy commands.
- **Data / storage**
  - **Prisma** ORM using **SQLite** (`prisma/dev.sqlite`) to store **Shopify sessions** via
    `@shopify/shopify-app-session-storage-prisma`.

---

## 2. High-Level Architecture

- **Entry / Server rendering**
  - `app/entry.server.tsx`:
    - Uses `renderToPipeableStream` to server‑render the React Router app via `<ServerRouter>`.
    - Adds Shopify-specific document headers using `addDocumentResponseHeaders` from `shopify.server.ts`.
  - `app/root.tsx`:
    - Wraps the entire app in an HTML shell and renders the current route via `<Outlet />`.
- **Shopify server setup**
  - `app/shopify.server.ts`:
    - Configures the Shopify app with:
      - `apiKey`, `apiSecretKey`, `SCOPES`, `SHOPIFY_APP_URL`, `SHOP_CUSTOM_DOMAIN` (from env).
      - `sessionStorage: new PrismaSessionStorage(prisma)` to store sessions in the database.
    - Exposes key helpers:
      - `authenticate` – used to guard routes and get `admin` API clients.
      - `login` – used for starting the OAuth login flow.
      - `registerWebhooks`, `addDocumentResponseHeaders`, etc.
- **Database / Prisma**
  - `app/db.server.ts`:
    - Creates a singleton `PrismaClient` (`prisma`) and reuses it in dev to avoid connection storms.
  - `prisma/schema.prisma`:
    - Defines a `Session` model with all the fields Shopify’s Prisma session adapter expects.
    - Uses a local SQLite file (`file:dev.sqlite`).

---

## 3. Routing & App Flows

React Router uses the `app/routes` folder to define routes. Important routes here:

- **Public landing page**
  - `app/routes/_index/route.tsx`
    - This is the **root index route** (non‑embedded) shown at the app’s base URL.
    - `loader`:
      - If a `shop` query param is present, redirects to `/app?...` to start embedded flow.
      - Otherwise, returns `{ showForm: Boolean(login) }` to decide whether to show the “Shop domain” login form.
    - Component:
      - Shows a marketing/landing layout.
      - If `showForm` is true, renders a `<Form method="post" action="/auth/login">` prompting for a shop domain.
- **Embedded app shell**
  - `app/routes/app.tsx`
    - `loader`:
      - Calls `authenticate.admin(request)` to ensure the shop is authenticated; redirects to auth if not.
      - Returns `{ apiKey: process.env.SHOPIFY_API_KEY }` for use by the client.
    - Component:
      - Wraps children with `<AppProvider embedded apiKey={apiKey}>`.
      - Renders an app navigation bar using Polaris web components (`<s-app-nav>`, `<s-link>`).
      - Uses `<Outlet />` to render nested `/app/*` routes (like `/app` and `/app/additional`).
    - `ErrorBoundary` & `headers`:
      - Delegates to Shopify’s `boundary` utilities so auth redirects and headers work correctly.
- **Embedded app home (GraphQL example)**
  - `app/routes/app._index.tsx`
    - `loader`:
      - Calls `authenticate.admin(request)` to require an authenticated admin context.
    - `action`:
      - Re‑authenticates and gets `admin`.
      - Runs an **Admin GraphQL `productCreate` mutation** to create a “{Color} Snowboard” product.
      - Runs an **Admin GraphQL `productVariantsBulkUpdate` mutation** to update the variant’s price.
      - Returns the created `product` and `variant` data as JSON.
    - Component:
      - Uses `useFetcher` to submit a `POST` to its own route (`fetcher.submit`) when the “Generate a product” button is clicked.
      - Uses `useAppBridge()` to:
        - Show a toast when a product is created.
        - Open the product in Shopify admin via `shopify.intents.invoke("edit:shopify/Product", { value: product.id })`.
      - Displays JSON output of the product and variants in `<pre>` blocks.
      - Shows informational sections about the stack (React Router, Polaris web components, GraphQL, Prisma) and links to docs.
- **Additional embedded page**
  - `app/routes/app.additional.tsx`
    - Linked from the embedded nav as “Additional page”.
    - Provides a scaffold for adding more embedded UI.

There are also webhook routes (for app uninstall and scopes updates) and auth routes under `app/routes/auth.*.tsx`, which follow the patterns defined by Shopify’s template.

---

## 4. Shopify Configuration & Webhooks

- **`shopify.app.toml`**
  - Defines the app’s identity and behavior in Shopify:
    - `client_id`, `name`, `application_url`, `embedded = true`.
    - `access_scopes.scopes = "write_products"` (needed for the product GraphQL example).
    - App‑specific webhooks:
      - `app/uninstalled` → `/webhooks/app/uninstalled`
      - `app/scopes_update` → `/webhooks/app/scopes_update`
    - `auth.redirect_urls` – OAuth callback URL(s).
- **`shopify.web.toml`**
  - Defines the **web process** for the app:
    - `roles = ["frontend", "backend"]`.
    - `webhooks_path = "/webhooks/app/uninstalled"`.
    - `predev = "npx prisma generate"` (ensures Prisma client is generated before dev server).
    - `dev = "npx prisma migrate deploy && npm exec react-router dev"` to start the React Router dev server with DB migrations.

---

## 5. Scripts & How to Run the Project

### 5.1. NPM scripts (`package.json`)

- **Development**
  - **`npm run dev`** → `shopify app dev`
    - Entry point for local development.
    - Uses Shopify CLI, reads TOML config, runs `predev` + `dev` commands.
- **Build & production**
  - **`npm run build`** → `react-router build`
  - **`npm run start`** → `react-router-serve ./build/server/index.js`
  - **`npm run docker-start`** → `npm run setup && npm run start`
  - **`npm run setup`** → `prisma generate && prisma migrate deploy`
- **Tooling**
  - **`npm run lint`** → ESLint.
  - **`npm run typecheck`** → `react-router typegen && tsc --noEmit`.
  - **`npm run prisma`**, **`npm run graphql-codegen`**, etc. for related tooling.

### 5.2. First-time local setup

1. **Install dependencies**
   - `npm install`
2. **Ensure Prisma client and DB are ready**
   - Either:
     - Run `npm run setup`, **or**
     - Let the Shopify CLI handle it through `predev`/`dev` when you run `npm run dev`.
3. **Configure environment**
   - Create `.env` (or use Shopify CLI env commands) with at least:
     - `SHOPIFY_API_KEY`
     - `SHOPIFY_API_SECRET`
     - `SCOPES` (should match or be compatible with `shopify.app.toml`)
     - `SHOPIFY_APP_URL`
     - Optional: `SHOP_CUSTOM_DOMAIN`
4. **Start dev environment**
   - `npm run dev`
   - Follow CLI prompts to log into your Shopify Partner account and select/create an app.
   - Press `P` in the CLI to open the app URL, then install it on your development store.

---

## 6. How Auth & Data Flow Works

- **Public to embedded app**
  - A merchant hits your app’s public URL (root route).
  - They either:
    - Are redirected to `/app` if a `shop` query param exists, **or**
    - Fill in the “Shop domain” form which posts to `/auth/login` to start OAuth.
- **OAuth & session storage**
  - Shopify handles OAuth via `login`/`authenticate` from `shopify.server.ts`.
  - On success:
    - Session details are stored in the `Session` table via `PrismaSessionStorage`.
    - The merchant is redirected to the embedded `/app` route inside the Shopify admin.
- **Using the Admin GraphQL API**
  - Within route loaders/actions, you call:
    - `const { admin } = await authenticate.admin(request);`
  - Then use `admin.graphql` (or REST helpers) to interact with the shop’s data.
  - Example: `app/routes/app._index.tsx` creates a product and updates its variant.

---

## 7. Extending the App

- **Add new embedded pages**
  - Create new routes under `app/routes/app.*.tsx`, for example:
    - `app/routes/app.orders.tsx` → `/app/orders`
  - In the route’s `loader`/`action`, always call `authenticate.admin(request)` for protected admin actions.
  - Add navigation in `app/routes/app.tsx` via `<s-link href="/app/orders">Orders</s-link>`.
- **Add new public pages**
  - Add routes under `app/routes` without the `app.` prefix, for example:
    - `app/routes/pricing.tsx` → `/pricing`
- **Use additional webhooks**
  - Add `webhooks.subscriptions` entries in `shopify.app.toml`.
  - Implement corresponding routes in `app/routes/webhooks.*.tsx` using the webhook helpers from the Shopify SDK.

---

## 8. Troubleshooting (Quick Pointers)

- **“The table `main.Session` does not exist”**
  - Run `npm run setup` or ensure `prisma migrate deploy` has been executed.
- **Navigating breaks inside the embedded app**
  - Use React Router’s `Link` or Polaris/App Bridge navigation, not raw `<a>` tags.
  - Use `redirect` from `authenticate.admin`, not from `react-router` in auth flows.
- **Webhooks not updating**
  - Prefer app-specific webhooks defined in `shopify.app.toml`; run `npm run deploy` to sync.

This guide should give you enough context to navigate the codebase, run the project, and start extending the Shopify app with new routes, APIs, and UI. 


