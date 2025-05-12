import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/supabase";

const PUBLIC_ROUTES = new Set(["/", "/sign-in", "/sign-up", "/auth/callback"]);
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS?.split(",") || [
  "localhost:3000",
];

export async function updateSession(
  request: NextRequest
): Promise<NextResponse> {
  const response = NextResponse.next();
  const { pathname, hostname } = request.nextUrl;
  const tenantSlug = hostname.split(".")[0];

  // Validación de dominio
  if (!isValidDomain(hostname)) {
    return NextResponse.redirect(new URL("/404", request.url));
  }

  const supabase = createMiddlewareClient<Database>({
    req: request,
    res: response,
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirección para rutas privadas sin autenticación
  if (!user && !PUBLIC_ROUTES.has(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Manejo de contexto multi-tenant si está autenticado y no es dominio raíz
  if (user && !isRootDomain(hostname)) {
    const tenant = await validateTenantAccess(supabase, user.id, tenantSlug);
    if (!tenant) {
      return NextResponse.redirect(new URL("/auth/unauthorized", request.url));
    }
    setTenantContext(response, tenant);
  }

  return response;
}

// Helpers
const isValidDomain = (hostname: string) => {
  return ALLOWED_DOMAINS.some((domain) => {
    const [mainDomain] = domain.split(":");
    return hostname === mainDomain || hostname.endsWith(`.${mainDomain}`);
  });
};

const isRootDomain = (hostname: string) => {
  return ALLOWED_DOMAINS.includes(hostname);
};

const validateTenantAccess = async (
  supabase: ReturnType<typeof createMiddlewareClient<Database>>,
  userId: string,
  tenantSlug: string
) => {
  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, slug, tenant_users!inner(role)")
    .eq("slug", tenantSlug)
    .eq("tenant_users.user_id", userId)
    .single();

  if (error || !tenant || !tenant.tenant_users?.length) return null;

  return {
    id: tenant.id,
    slug: tenant.slug,
    role: tenant.tenant_users[0].role,
  };
};

const setTenantContext = (
  response: NextResponse,
  tenant: {
    id: string;
    slug: string;
    role: string;
  }
) => {
  response.headers.set("x-tenant-id", tenant.id);
  response.headers.set("x-tenant-slug", tenant.slug);
  response.headers.set("x-tenant-role", tenant.role);

  response.cookies.set("tenant_context", JSON.stringify(tenant), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 día
  });
};
