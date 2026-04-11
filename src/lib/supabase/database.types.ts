export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  catalog: {
    Tables: {
      classes: {
        Row: {
          cfu: number | null
          created_at: string
          description: string | null
          fts: string | null
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          cfu?: number | null
          created_at?: string
          description?: string | null
          fts?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          cfu?: number | null
          created_at?: string
          description?: string | null
          fts?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      course_classes: {
        Row: {
          catalogue_url: string | null
          class_id: string
          class_year: number
          code: string
          course_id: string
          created_at: string
          curriculum: string | null
          mandatory: boolean
          position: number
          updated_at: string
        }
        Insert: {
          catalogue_url?: string | null
          class_id: string
          class_year: number
          code: string
          course_id: string
          created_at?: string
          curriculum?: string | null
          mandatory?: boolean
          position?: number
          updated_at?: string
        }
        Update: {
          catalogue_url?: string | null
          class_id?: string
          class_year?: number
          code?: string
          course_id?: string
          created_at?: string
          curriculum?: string | null
          mandatory?: boolean
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_classes_course_id_fkey"
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
        ]
      }
      courses: {
        Row: {
          cfu: number | null
          code: string
          course_type: Database["public"]["Enums"]["course_type"]
          created_at: string
          department_id: string
          description: string | null
          fts: string | null
          id: string
          location: Database["public"]["Enums"]["campus_location"] | null
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          cfu?: number | null
          code: string
          course_type?: Database["public"]["Enums"]["course_type"]
          created_at?: string
          department_id: string
          description?: string | null
          fts?: string | null
          id?: string
          location?: Database["public"]["Enums"]["campus_location"] | null
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          cfu?: number | null
          code?: string
          course_type?: Database["public"]["Enums"]["course_type"]
          created_at?: string
          department_id?: string
          description?: string | null
          fts?: string | null
          id?: string
          location?: Database["public"]["Enums"]["campus_location"] | null
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
        ]
      }
      department_locations: {
        Row: {
          address: string
          campus_location: Database["public"]["Enums"]["campus_location"] | null
          created_at: string | null
          department_id: string
          id: string
          is_primary: boolean | null
          latitude: number
          longitude: number
          name: string
          position: number | null
          updated_at: string
        }
        Insert: {
          address: string
          campus_location?:
            | Database["public"]["Enums"]["campus_location"]
            | null
          created_at?: string | null
          department_id: string
          id?: string
          is_primary?: boolean | null
          latitude: number
          longitude: number
          name: string
          position?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          campus_location?:
            | Database["public"]["Enums"]["campus_location"]
            | null
          created_at?: string | null
          department_id?: string
          id?: string
          is_primary?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          position?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_locations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          area: Database["public"]["Enums"]["department_area"] | null
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          area?: Database["public"]["Enums"]["department_area"] | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          area?: Database["public"]["Enums"]["department_area"] | null
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
          id?: string
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
          id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
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
            referencedRelation: "bookmarks_detail"
            referencedColumns: ["question_id"]
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
      content_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          handled_at: string | null
          handled_by: string | null
          id: string
          request_type: Database["public"]["Enums"]["content_request_type"]
          status: Database["public"]["Enums"]["content_request_status"]
          submitted_content: Json
          target_class_id: string | null
          target_course_id: string | null
          target_department_id: string | null
          target_section_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          request_type: Database["public"]["Enums"]["content_request_type"]
          status?: Database["public"]["Enums"]["content_request_status"]
          submitted_content: Json
          target_class_id?: string | null
          target_course_id?: string | null
          target_department_id?: string | null
          target_section_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          request_type?: Database["public"]["Enums"]["content_request_type"]
          status?: Database["public"]["Enums"]["content_request_status"]
          submitted_content?: Json
          target_class_id?: string | null
          target_course_id?: string | null
          target_department_id?: string | null
          target_section_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_requests_handled_by_fkey"
            columns: ["handled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_requests_target_class_id_fkey"
            columns: ["target_class_id"]
            isOneToOne: false
            referencedRelation: "bookmarks_detail"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "content_requests_target_class_id_fkey"
            columns: ["target_class_id"]
            isOneToOne: false
            referencedRelation: "progress_detail"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "content_requests_target_class_id_fkey"
            columns: ["target_class_id"]
            isOneToOne: false
            referencedRelation: "user_classes_detail"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "content_requests_target_class_id_fkey"
            columns: ["target_class_id"]
            isOneToOne: false
            referencedRelation: "user_recent_classes_detail"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "content_requests_target_course_id_fkey"
            columns: ["target_course_id"]
            isOneToOne: false
            referencedRelation: "bookmarks_detail"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "content_requests_target_course_id_fkey"
            columns: ["target_course_id"]
            isOneToOne: false
            referencedRelation: "progress_detail"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "content_requests_target_course_id_fkey"
            columns: ["target_course_id"]
            isOneToOne: false
            referencedRelation: "user_classes_detail"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "content_requests_target_course_id_fkey"
            columns: ["target_course_id"]
            isOneToOne: false
            referencedRelation: "user_recent_classes_detail"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "content_requests_target_department_id_fkey"
            columns: ["target_department_id"]
            isOneToOne: false
            referencedRelation: "bookmarks_detail"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "content_requests_target_department_id_fkey"
            columns: ["target_department_id"]
            isOneToOne: false
            referencedRelation: "progress_detail"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "content_requests_target_department_id_fkey"
            columns: ["target_department_id"]
            isOneToOne: false
            referencedRelation: "user_classes_detail"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "content_requests_target_department_id_fkey"
            columns: ["target_department_id"]
            isOneToOne: false
            referencedRelation: "user_recent_classes_detail"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "content_requests_target_section_id_fkey"
            columns: ["target_section_id"]
            isOneToOne: false
            referencedRelation: "bookmarks_detail"
            referencedColumns: ["section_id"]
          },
          {
            foreignKeyName: "content_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department_id: string | null
          email: string | null
          id: string
          image: string | null
          name: string | null
          role: Database["public"]["Enums"]["role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          email?: string | null
          id: string
          image?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          email?: string | null
          id?: string
          image?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "bookmarks_detail"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "progress_detail"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "user_classes_detail"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "user_recent_classes_detail"
            referencedColumns: ["department_id"]
          },
        ]
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
          id?: string
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
            referencedRelation: "bookmarks_detail"
            referencedColumns: ["section_id"]
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
      user_classes: {
        Row: {
          class_id: string
          course_id: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          class_id: string
          course_id: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          class_id?: string
          course_id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "bookmarks_detail"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "user_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "progress_detail"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "user_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "user_classes_detail"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "user_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "user_recent_classes_detail"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "user_classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "bookmarks_detail"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "user_classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "progress_detail"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "user_classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "user_classes_detail"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "user_classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "user_recent_classes_detail"
            referencedColumns: ["course_id"]
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
          course_id: string
          last_visited: string
          user_id: string
          visit_count: number
        }
        Insert: {
          class_id: string
          course_id: string
          last_visited?: string
          user_id: string
          visit_count?: number
        }
        Update: {
          class_id?: string
          course_id?: string
          last_visited?: string
          user_id?: string
          visit_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_recent_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "bookmarks_detail"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "user_recent_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "progress_detail"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "user_recent_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "user_classes_detail"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "user_recent_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "user_recent_classes_detail"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "user_recent_classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "bookmarks_detail"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "user_recent_classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "progress_detail"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "user_recent_classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "user_classes_detail"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "user_recent_classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "user_recent_classes_detail"
            referencedColumns: ["course_id"]
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
      bookmarks_detail: {
        Row: {
          class_id: string | null
          class_name: string | null
          content: string | null
          correct_answer: string[] | null
          course_id: string | null
          course_name: string | null
          created_at: string | null
          department_id: string | null
          department_name: string | null
          difficulty: Database["public"]["Enums"]["difficulty"] | null
          explanation: string | null
          options: Json | null
          question_id: string | null
          question_type: Database["public"]["Enums"]["question_type"] | null
          section_id: string | null
          section_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_detail: {
        Row: {
          average_score: number | null
          best_score: number | null
          class_id: string | null
          class_name: string | null
          consistency_score: number | null
          course_id: string | null
          course_name: string | null
          department_id: string | null
          department_name: string | null
          first_accessed_at: string | null
          id: string | null
          improvement_rate: number | null
          last_accessed_at: string | null
          quiz_mode: Database["public"]["Enums"]["quiz_mode"] | null
          quizzes_taken: number | null
          section_id: string | null
          section_name: string | null
          total_time_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "bookmarks_detail"
            referencedColumns: ["section_id"]
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
      user_classes_detail: {
        Row: {
          catalogue_url: string | null
          class_code: string | null
          class_id: string | null
          class_name: string | null
          class_year: number | null
          course_code: string | null
          course_id: string | null
          course_name: string | null
          course_type: Database["public"]["Enums"]["course_type"] | null
          created_at: string | null
          curriculum: string | null
          department_code: string | null
          department_id: string | null
          department_name: string | null
          mandatory: boolean | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_classes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recent_classes_detail: {
        Row: {
          catalogue_url: string | null
          class_code: string | null
          class_id: string | null
          class_name: string | null
          class_year: number | null
          course_code: string | null
          course_id: string | null
          course_name: string | null
          course_type: Database["public"]["Enums"]["course_type"] | null
          curriculum: string | null
          department_code: string | null
          department_id: string | null
          department_name: string | null
          last_visited: string | null
          mandatory: boolean | null
          user_id: string | null
          visit_count: number | null
        }
        Relationships: [
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
    Functions: {
      can_access_section: { Args: { sec_id: string }; Returns: boolean }
      is_class_admin: { Args: { cls_id: string }; Returns: boolean }
      is_course_maintainer: { Args: { crs_id: string }; Returns: boolean }
      is_department_admin: { Args: { dept_id: string }; Returns: boolean }
      is_section_admin: { Args: { sec_id: string }; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
    }
    Enums: {
      campus_location: "MODENA" | "REGGIO_EMILIA" | "CARPI" | "MANTOVA"
      content_request_status:
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "NEEDS_REVISION"
      content_request_type:
        | "NEW_SECTION"
        | "NEW_QUESTIONS"
        | "REPORT"
        | "FILE_UPLOAD"
      course_type: "BACHELOR" | "MASTER" | "SINGLE_CYCLE"
      department_area:
        | "SCIENZE"
        | "TECNOLOGIA"
        | "SALUTE"
        | "VITA"
        | "SOCIETA_CULTURA"
      difficulty: "EASY" | "MEDIUM" | "HARD"
      notification_type:
        | "REQUEST_STATUS_CHANGED"
        | "NEW_REQUEST_RECEIVED"
        | "REQUEST_NEEDS_REVISION"
        | "REQUEST_REVISED"
        | "CONTENT_UPDATED"
        | "NEW_SECTION_ADDED"
      question_type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
      quiz_mode: "STUDY" | "EXAM_SIMULATION"
      role: "SUPERADMIN" | "ADMIN" | "MAINTAINER" | "STUDENT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  quiz: {
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
          id?: string
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
            foreignKeyName: "answer_attempts_quiz_attempt_id_fkey"
            columns: ["quiz_attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answer_attempts_quiz_attempt_id_fkey"
            columns: ["quiz_attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts_detail"
            referencedColumns: ["id"]
          },
        ]
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
          id?: string
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
      quiz_attempts: {
        Row: {
          completed_at: string | null
          id: string
          quiz_id: string
          score: number
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          quiz_id: string
          score: number
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
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
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes_detail"
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
          id?: string
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
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes_detail"
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
          id?: string
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
        ]
      }
    }
    Views: {
      quiz_attempts_detail: {
        Row: {
          class_id: string | null
          class_name: string | null
          completed_at: string | null
          course_id: string | null
          course_name: string | null
          department_id: string | null
          department_name: string | null
          evaluation_mode_id: string | null
          id: string | null
          quiz_id: string | null
          quiz_mode: Database["public"]["Enums"]["quiz_mode"] | null
          score: number | null
          section_id: string | null
          section_name: string | null
          time_limit: number | null
          time_spent: number | null
          user_id: string | null
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
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_evaluation_mode_id_fkey"
            columns: ["evaluation_mode_id"]
            isOneToOne: false
            referencedRelation: "evaluation_modes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes_detail: {
        Row: {
          class_id: string | null
          class_name: string | null
          course_id: string | null
          course_name: string | null
          created_at: string | null
          department_id: string | null
          department_name: string | null
          evaluation_mode_id: string | null
          id: string | null
          quiz_mode: Database["public"]["Enums"]["quiz_mode"] | null
          section_id: string | null
          section_name: string | null
          time_limit: number | null
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
            foreignKeyName: "sections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts_detail"
            referencedColumns: ["class_id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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

export type CatalogTables<T extends keyof Database["catalog"]["Tables"]> =
  Database["catalog"]["Tables"][T]["Row"]

export const Constants = {
  catalog: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      campus_location: ["MODENA", "REGGIO_EMILIA", "CARPI", "MANTOVA"],
      content_request_status: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "NEEDS_REVISION",
      ],
      content_request_type: [
        "NEW_SECTION",
        "NEW_QUESTIONS",
        "REPORT",
        "FILE_UPLOAD",
      ],
      course_type: ["BACHELOR", "MASTER", "SINGLE_CYCLE"],
      department_area: [
        "SCIENZE",
        "TECNOLOGIA",
        "SALUTE",
        "VITA",
        "SOCIETA_CULTURA",
      ],
      difficulty: ["EASY", "MEDIUM", "HARD"],
      notification_type: [
        "REQUEST_STATUS_CHANGED",
        "NEW_REQUEST_RECEIVED",
        "REQUEST_NEEDS_REVISION",
        "REQUEST_REVISED",
        "CONTENT_UPDATED",
        "NEW_SECTION_ADDED",
      ],
      question_type: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"],
      quiz_mode: ["STUDY", "EXAM_SIMULATION"],
      role: ["SUPERADMIN", "ADMIN", "MAINTAINER", "STUDENT"],
    },
  },
  quiz: {
    Enums: {},
  },
} as const

