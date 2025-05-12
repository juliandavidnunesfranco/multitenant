export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone_number: string | null;
          hashed_password: string;
          mfa_enabled: boolean | null;
          mfa_secret: string | null;
          status: string;
          password_changed_at: string | null;
          last_sign_in_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["users"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      user_roles: {
        Row: {
          user_id: string;
          role_id: string;
          tenant_id: string | null;
          created_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["user_roles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Row"]>;
        Relationships: {
          user: Database["public"]["Tables"]["users"]["Row"];
          role: Database["public"]["Tables"]["roles"]["Row"];
          tenant: Database["public"]["Tables"]["tenants"]["Row"];
        };
      };
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          features: Json | null;
          settings: Json | null;
          status: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["tenants"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["tenants"]["Row"]>;
      };
      tenant_users: {
        Row: {
          tenant_id: string;
          user_id: string;
          created_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["tenant_users"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["tenant_users"]["Row"]>;
        Relationships: {
          tenant: Database["public"]["Tables"]["tenants"]["Row"];
          user: Database["public"]["Tables"]["users"]["Row"];
        };
      };
      roles: {
        Row: {
          id: string;
          tenant_id: string | null;
          name: string;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["roles"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["roles"]["Row"]>;
        Relationships: {
          tenant: Database["public"]["Tables"]["tenants"]["Row"];
        };
      };
      permissions: {
        Row: {
          id: string;
          tenant_id: string | null;
          name: string;
          description: string | null;
          created_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["permissions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["permissions"]["Row"]>;
        Relationships: {
          tenant: Database["public"]["Tables"]["tenants"]["Row"];
        };
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
          created_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["role_permissions"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["role_permissions"]["Row"]>;
        Relationships: {
          role: Database["public"]["Tables"]["roles"]["Row"];
          permission: Database["public"]["Tables"]["permissions"]["Row"];
        };
      };
    };
  };
  tenant_template: {
    Tables: {
      documents: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          version: string;
          status: string;
          content: Json;
          metadata: Json | null;
          created_by: string;
          updated_by: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<
          Database["tenant_template"]["Tables"]["documents"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["tenant_template"]["Tables"]["documents"]["Row"]>;
        Relationships: {
          creator: Database["public"]["Tables"]["users"]["Row"];
          updater: Database["public"]["Tables"]["users"]["Row"];
        };
      };
      signatures: {
        Row: {
          id: string;
          document_id: string | null;
          user_id: string | null;
          signature_data: string;
          signature_date: string | null;
          reason: string;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: Omit<Database["tenant_template"]["Tables"]["signatures"]["Row"], "id" | "created_at">;
        Update: Partial<Database["tenant_template"]["Tables"]["signatures"]["Row"]>;
        Relationships: {
          document: Database["tenant_template"]["Tables"]["documents"]["Row"];
          user: Database["public"]["Tables"]["users"]["Row"];
        };
      };
    };
  };
  audit: {
    Tables: {
      logs: {
        Row: {
          id: string;
          event_data: Json;
          created_at: string | null;
        };
        Insert: Omit<Database["audit"]["Tables"]["logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["audit"]["Tables"]["logs"]["Row"]>;
      };
    };
  };
}

// Tipos de ayuda
export type Tables<
  T extends
    | keyof Database["public"]["Tables"]
    | keyof Database["tenant_template"]["Tables"]
    | keyof Database["audit"]["Tables"]
> = T extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][T]["Row"]
  : T extends keyof Database["tenant_template"]["Tables"]
  ? Database["tenant_template"]["Tables"][T]["Row"]
  : T extends keyof Database["audit"]["Tables"]
  ? Database["audit"]["Tables"][T]["Row"]
  : never;

// Tipos específicos más comunes
export type User = Tables<"users">;
export type Tenant = Tables<"tenants">;
export type TenantUser = Tables<"tenant_users"> & {
  tenant?: Tenant;
  user?: User;
};
export type Role = Tables<"roles">;
export type Permission = Tables<"permissions">;
export type Document = Tables<"documents">;
export type Signature = Tables<"signatures">;
export type AuditLog = Tables<"logs">;
