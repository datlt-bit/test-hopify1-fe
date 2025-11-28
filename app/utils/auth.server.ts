import { authenticate, sessionStorage } from "../shopify.server";

/**
 * Wrapper around authenticate.admin that logs session information
 * for debugging authentication state across page navigations.
 */
export async function authenticateWithLogging(request: Request) {
  const url = new URL(request.url);
  console.log(`\n[AUTH] ========================================`);
  console.log(`[AUTH] Request to: ${url.pathname}`);
  console.log(`[AUTH] Method: ${request.method}`);
  console.log(`[AUTH] Search params: ${url.searchParams.toString()}`);
  console.log(`[AUTH] Authorization header: ${request.headers.get("authorization")?.substring(0, 30)}...`);
  console.log(`[AUTH] Cookie: ${request.headers.get("cookie")?.substring(0, 50)}...`);

  try {
    const result = await authenticate.admin(request);
    const { session, admin } = result;

    console.log(`[AUTH] ✅ Authentication successful`);
    console.log(`[AUTH] Shop: ${session.shop}`);
    console.log(`[AUTH] Session ID: ${session.id}`);
    console.log(`[AUTH] Is Online: ${session.isOnline}`);
    console.log(`[AUTH] Scopes: ${session.scope}`);
    console.log(`[AUTH] Access Token exists: ${!!session.accessToken}`);
    console.log(`[AUTH] Access Token (first 10 chars): ${session.accessToken?.substring(0, 10)}...`);
    console.log(`[AUTH] Expires: ${session.expires}`);
    console.log(`[AUTH] ========================================\n`);

    return result;
  } catch (error) {
    console.log(`[AUTH] ❌ Authentication failed`);
    console.log(`[AUTH] Error:`, error);
    console.log(`[AUTH] ========================================\n`);
    throw error;
  }
}

/**
 * Get session information for a shop without full authentication.
 * Useful for debugging session state.
 */
export async function getSessionInfo(shop: string) {
  try {
    const sessions = await sessionStorage.findSessionsByShop(shop);
    console.log(`[SESSION] Found ${sessions.length} session(s) for shop: ${shop}`);
    
    for (const session of sessions) {
      console.log(`[SESSION] ID: ${session.id}`);
      console.log(`[SESSION] Is Online: ${session.isOnline}`);
      console.log(`[SESSION] Has Access Token: ${!!session.accessToken}`);
      console.log(`[SESSION] Expires: ${session.expires}`);
    }
    
    return sessions;
  } catch (error) {
    console.log(`[SESSION] Error fetching sessions:`, error);
    return [];
  }
}

