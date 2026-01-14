import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { auth } from "@/auth-client";

export const load: LayoutServerLoad = async ({ request, url }) => {
  let isAuthenticated = false;
  try {
    const { data: session } = await auth.getSession(request);
    isAuthenticated = !!session;
  } catch (e) {}

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
