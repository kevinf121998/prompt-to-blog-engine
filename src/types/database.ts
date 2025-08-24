export interface Database {
  public: {
    Tables: {
      briefs: {
        Row: {
          id: string;
          user_id: string;
          json: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          json: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          json?: any;
          created_at?: string;
        };
      };
      drafts: {
        Row: {
          id: string;
          brief_id: string;
          blog_md: string;
          linkedin_txt: string;
          footnotes_md: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brief_id: string;
          blog_md: string;
          linkedin_txt: string;
          footnotes_md?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brief_id?: string;
          blog_md?: string;
          linkedin_txt?: string;
          footnotes_md?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Brief = Database['public']['Tables']['briefs']['Row'];
export type Draft = Database['public']['Tables']['drafts']['Row'];
