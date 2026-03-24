Connecting to db 5432
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      answer_attempts: {
        Row: {
          id: string
          question_id: string
          quiz_attempt_id: string
          score: number
          user_answer: string[]
        }
        Insert: {
          id: string
          question_id: string
          quiz_attempt_id: string
          score: number
          user_answer: string[]
        }
        Update: {
          id?: string
          question_id?: string
          quiz_attempt_id?: string
          score?: number
          user_answer?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "answer_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answer_attempts_quiz_attempt_id_fkey"
            columns: ["quiz_attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          class_year: number
          code: string
          course_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          class_year: number
          code: string
          course_id: string
          created_at?: string
          description?: string | null
          id: string
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          class_year?: number
          code?: string
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_maintainers: {
        Row: {
          course_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_maintainers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_maintainers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          course_type: Database["public"]["Enums"]["course_type"]
          created_at: string
          department_id: string
          description: string | null
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          code: string
          course_type?: Database["public"]["Enums"]["course_type"]
          created_at?: string
          department_id: string
          description?: string | null
          id: string
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          code?: string
          course_type?: Database["public"]["Enums"]["course_type"]
          created_at?: string
          department_id?: string
          description?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      department_admins: {
        Row: {
          created_at: string
          department_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_admins_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id: string
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      evaluation_modes: {
        Row: {
          correct_answer_points: number
          created_at: string
          description: string | null
          id: string
          incorrect_answer_points: number
          name: string
          partial_credit_enabled: boolean
          updated_at: string
        }
        Insert: {
          correct_answer_points?: number
          created_at?: string
          description?: string | null
          id: string
          incorrect_answer_points?: number
          name: string
          partial_credit_enabled?: boolean
          updated_at?: string
        }
        Update: {
          correct_answer_points?: number
          created_at?: string
          description?: string | null
          id?: string
          incorrect_answer_points?: number
          name?: string
          partial_credit_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          image: string | null
          name: string | null
          role: Database["public"]["Enums"]["role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          image?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          image?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["role"]
          updated_at?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          average_score: number | null
          best_score: number | null
          consistency_score: number | null
          first_accessed_at: string
          id: string
          improvement_rate: number | null
          last_accessed_at: string
          quiz_mode: Database["public"]["Enums"]["quiz_mode"]
          quizzes_taken: number
          section_id: string
          total_time_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_score?: number | null
          best_score?: number | null
          consistency_score?: number | null
          first_accessed_at?: string
          id: string
          improvement_rate?: number | null
          last_accessed_at?: string
          quiz_mode: Database["public"]["Enums"]["quiz_mode"]
          quizzes_taken?: number
          section_id: string
          total_time_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_score?: number | null
          best_score?: number | null
          consistency_score?: number | null
          first_accessed_at?: string
          id?: string
          improvement_rate?: number | null
          last_accessed_at?: string
          quiz_mode?: Database["public"]["Enums"]["quiz_mode"]
          quizzes_taken?: number
          section_id?: string
          total_time_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          content: string
          correct_answer: string[]
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          explanation: string | null
          id: string
          options: Json | null
          question_type: Database["public"]["Enums"]["question_type"]
          section_id: string
          updated_at: string
        }
        Insert: {
          content: string
          correct_answer: string[]
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          explanation?: string | null
          id: string
          options?: Json | null
          question_type: Database["public"]["Enums"]["question_type"]
          section_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          correct_answer?: string[]
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          explanation?: string | null
          id?: string
          options?: Json | null
          question_type?: Database["public"]["Enums"]["question_type"]
          section_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          completed_at: string
          id: string
          quiz_id: string
          score: number
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          id: string
          quiz_id: string
          score: number
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          quiz_id?: string
          score?: number
          time_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          id: string
          order: number
          question_id: string
          quiz_id: string
        }
        Insert: {
          created_at?: string
          id: string
          order: number
          question_id: string
          quiz_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order?: number
          question_id?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          evaluation_mode_id: string
          id: string
          quiz_mode: Database["public"]["Enums"]["quiz_mode"]
          section_id: string
          time_limit: number | null
        }
        Insert: {
          created_at?: string
          evaluation_mode_id: string
          id: string
          quiz_mode?: Database["public"]["Enums"]["quiz_mode"]
          section_id: string
          time_limit?: number | null
        }
        Update: {
          created_at?: string
          evaluation_mode_id?: string
          id?: string
          quiz_mode?: Database["public"]["Enums"]["quiz_mode"]
          section_id?: string
          time_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_evaluation_mode_id_fkey"
            columns: ["evaluation_mode_id"]
            isOneToOne: false
            referencedRelation: "evaluation_modes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      section_access: {
        Row: {
          created_at: string
          section_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          section_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          section_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_access_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          id: string
          is_public?: boolean
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_classes: {
        Row: {
          class_id: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_classes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recent_classes: {
        Row: {
          class_id: string
          last_visited: string
          user_id: string
          visit_count: number
        }
        Insert: {
          class_id: string
          last_visited?: string
          user_id: string
          visit_count?: number
        }
        Update: {
          class_id?: string
          last_visited?: string
          user_id?: string
          visit_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_recent_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recent_classes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      course_type: "BACHELOR" | "MASTER"
      difficulty: "EASY" | "MEDIUM" | "HARD"
      question_type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
      quiz_mode: "STUDY" | "EXAM_SIMULATION"
      role: "SUPERADMIN" | "ADMIN" | "MAINTAINER" | "STUDENT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      course_type: ["BACHELOR", "MASTER"],
      difficulty: ["EASY", "MEDIUM", "HARD"],
      question_type: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"],
      quiz_mode: ["STUDY", "EXAM_SIMULATION"],
      role: ["SUPERADMIN", "ADMIN", "MAINTAINER", "STUDENT"],
    },
  },
} as const

A new version of Supabase CLI is available: v2.78.1 (currently installed v2.75.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
