export type Database = {
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
  tenant_template: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          tenant_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          tenant_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          tenant_id?: string;
        };
      };
    };
  };
};
