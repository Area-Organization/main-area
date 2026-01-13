import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { authClient } from "@/auth-client";

export const load: LayoutServerLoad = async ({ request, url }) => {
  const cookieHeader = request.headers.get("cookie") || "";
  let isAuthenticated = false;

  // Log for debugging in Dokploy console
  if (cookieHeader) {
    console.log(`[Auth Check] Cookie found in request for: ${url.pathname}`);
  } else {
    console.log(`[Auth Check] No cookies found in request for: ${url.pathname}`);
  }

  try {
    const { data: session } = await authClient.getSession({
      fetchOptions: {
        headers: {
          cookie: cookieHeader
        }
      }
    });
    isAuthenticated = !!session;
  } catch (e) {
    console.error("[Auth Check] Error fetching session:", e);
  }

  const publicRoutes = ["/login", "/register"];
  const path = url.pathname;
  const isPublic = publicRoutes.some((route) => path.startsWith(route));

  if (!isAuthenticated && !isPublic) {
    const fromUrl = url.pathname + url.search;
    throw redirect(302, `/login?redirectTo=${encodeURIComponent(fromUrl)}`);
  }

  if (isAuthenticated && isPublic) {
    const redirectTo = url.searchParams.get("redirectTo");
    throw redirect(302, redirectTo ? decodeURIComponent(redirectTo) : "/");
  }

  return {
    isAuthenticated
  };
};
