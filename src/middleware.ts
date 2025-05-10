import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Database } from "@/types/supabase";

// Definimos los dominios permitidos
const allowedDomains = ["localhost:3000", "tudominio.com"]; // process.env.ALLOWED_DOMAINS

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Get the tenant from the hostname
  const hostname = req.headers.get("host")?.split(":")[0] || "";

  // Validar si el dominio está permitido
  const isAllowedDomain = allowedDomains.some((domain) => {
    // Caso especial para localhost
    if (domain === "localhost:3000") {
      return hostname === "localhost";
    }

    return (
      hostname === domain || // Dominio raíz exacto
      hostname.endsWith(`.${domain}`) // Subdominio válido
    );
  });

  if (!isAllowedDomain) {
    return NextResponse.redirect(new URL("/404", req.url));
  }

  // Manejo del dominio raíz (sin subdominio)
  const isRootDomain = allowedDomains.includes(hostname);
  if (isRootDomain) {
    // Si es el dominio principal, no procesar tenant
    return res;
  }
  //const searchParams = req.nextUrl.searchParams
  const tenantSlug = hostname.split(".")[0];

  // Check if we're on a custom domain
  const currentUser = await supabase.auth.getUser();

  // If no session, only allow access to public routes
  if (!currentUser.data?.user) {
    const isPublicRoute =
      req.nextUrl.pathname.includes("/signin") ||
      req.nextUrl.pathname === "/" ||
      req.nextUrl.pathname.startsWith("/_next") ||
      req.nextUrl.pathname.startsWith("/api/public");

    if (!isPublicRoute) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    return res;
  }

  // Get tenant info and verify access
  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, slug")
    .eq("slug", tenantSlug)
    .single();

  if (!tenant || error) {
    return NextResponse.redirect(new URL("/404", req.url));
  }

  // Verify user has access to this tenant
  const { data: tenantUser } = await supabase
    .from("tenant_users")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", currentUser.data.user.id)
    .single();

  if (!tenantUser) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Add tenant and role context to requests
  req.headers.set("x-tenant-id", tenant.id);
  req.headers.set("x-tenant-slug", tenant.slug);
  req.headers.set("x-tenant-role", tenantUser.role);

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
