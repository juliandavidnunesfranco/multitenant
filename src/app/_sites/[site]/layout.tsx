import {  validateTenantAccess } from "@/lib/tenant-server";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function TenantLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ site: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const tenantAccess = await validateTenantAccess(
    params.site,
    session?.user?.id
  );

  if (!tenantAccess) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Add tenant-specific layout components here */}
      {children}
    </div>
  );
}
