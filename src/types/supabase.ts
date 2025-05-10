export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          created_at?: string;
        };
      };
      tenant_users: {
        Row: {
          tenant_id: string;
          user_id: string;
          role: string;
        };
        Insert: {
          tenant_id: string;
          user_id: string;
          role: string;
        };
        Update: {
          tenant_id?: string;
          user_id?: string;
          role?: string;
        };
      };
    };
  };
  shared: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          created_at?: string;
        };
      };
      tenant_users: {
        Row: {
          tenant_id: string;
          user_id: string;
          role: string;
        };
        Insert: {
          tenant_id: string;
          user_id: string;
          role: string;
        };
        Update: {
          tenant_id?: string;
          user_id?: string;
          role?: string;
        };
      };
    };
  };
};

// Tipos auxiliares
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type TenantUser = Database["public"]["Tables"]["tenant_users"]["Row"];
