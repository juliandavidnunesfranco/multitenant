import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.error("Error setting cookie:", error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            console.error("Error removing cookie:", error);
          }
        },
      },
    }
  );
};

interface TenantContext {
  id: string;
  slug: string | undefined;
  role: string;
}

export const getTenantFromCookies = async (): Promise<TenantContext | null> => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("tenant_context")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getTenantContext = async (): Promise<TenantContext | null> => {
  // const cookieStore = await cookies();
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) return null;

  // Definimos el tipo de respuesta esperado
  type TenantResponse = {
    tenant_id: string;
    role: string;
    tenants: {
      slug: string;
    };
  };

  const { data: tenant, error: TenantError } = await supabase
    .from("tenant_users")
    .select(
      `
      tenant_id,
      role,
      tenants:tenant_id (
        slug
      )
    `
    )
    .match({ user_id: user.id })
    .single<TenantResponse>();

  if (TenantError || !tenant) return null;

  return tenant
    ? {
        id: tenant.tenant_id,
        slug: tenant.tenants?.slug,
        role: tenant.role,
      }
    : null;
};
