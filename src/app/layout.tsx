import { Inter } from "next/font/google";
import { TenantProvider } from "@/components/providers/TenantProvider";
import { createServerClient, getTenant } from "@/lib/tenant-server";
import { headers } from "next/headers";
import "./globals.css";


const GeistSans = Inter({ subsets: ["latin"] });
export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  description: "Multi-tenant application platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const supabase = await createServerClient();
  const headersList = await headers();
  const hostName = headersList.get("host") || "";
  const tenantSlug = hostName.split(".")[0];

  

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get tenant if we're on a tenant subdomain
  const tenant = tenantSlug ? await getTenant(tenantSlug) : null;

  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background min-h-screen text-foreground">
        <TenantProvider
          initialTenant={tenant}
          initialUser={session?.user || null}
        >
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}
