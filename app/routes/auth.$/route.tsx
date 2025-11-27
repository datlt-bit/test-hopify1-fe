import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;
  const shop = searchParams.get("shop") || params["*"];

  if (!shop) {
    throw redirect("/auth/login");
  }

  const url = new URL("/auth/login", request.url);
  url.searchParams.set("shop", shop);

  throw redirect(url.toString());
};


