export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      application_documents: {
        Row: {
          application_id: string
          document_type: string
          file_name: string
          file_size: number
          id: string
          mime_type: string
          storage_path: string
          uploaded_at: string | null
        }
        Insert: {
          application_id: string
          document_type: string
          file_name: string
          file_size: number
          id?: string
          mime_type: string
          storage_path: string
          uploaded_at?: string | null
        }
        Update: {
          application_id?: string
          document_type?: string
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string
          storage_path?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          academic_year: string
          additional_info: string | null
          address: string
          annual_family_income: string | null
          application_id: string
          application_type: string
          bank_account_number: string
          bank_name_branch: string
          college_address: string
          college_admitted: string | null
          course_joined: string | null
          course_studying: string | null
          created_at: string | null
          current_college: string | null
          date_of_admission: string | null
          date_of_birth: string
          district: string
          email: string
          family_adults_count: number | null
          family_children_count: number | null
          father_mobile: string | null
          father_name: string
          father_occupation: string | null
          first_year_max_marks: number | null
          first_year_percentage: number | null
          first_year_total_marks: number | null
          full_name: string
          gender: string | null
          goals_dreams: string | null
          group_subjects: string
          guardian_details: string | null
          guardian_name: string | null
          guardian_relationship: string | null
          high_school_studied: string
          id: string
          ifsc_code: string
          is_spotlight_eligible: boolean | null
          mandal: string
          mother_mobile: string | null
          mother_name: string
          mother_occupation: string | null
          phone: string
          pincode: string
          previous_application_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          spotlight_annual_need: number | null
          spotlight_enabled: boolean | null
          spotlight_enabled_at: string | null
          spotlight_order: number | null
          spotlight_story: string | null
          ssc_max_marks: number
          ssc_percentage: number
          ssc_total_marks: number
          status: string
          student_id: string
          study_activities: string | null
          updated_at: string | null
          village: string
        }
        Insert: {
          academic_year: string
          additional_info?: string | null
          address: string
          annual_family_income?: string | null
          application_id: string
          application_type: string
          bank_account_number: string
          bank_name_branch: string
          college_address: string
          college_admitted?: string | null
          course_joined?: string | null
          course_studying?: string | null
          created_at?: string | null
          current_college?: string | null
          date_of_admission?: string | null
          date_of_birth: string
          district: string
          email: string
          family_adults_count?: number | null
          family_children_count?: number | null
          father_mobile?: string | null
          father_name: string
          father_occupation?: string | null
          first_year_max_marks?: number | null
          first_year_percentage?: number | null
          first_year_total_marks?: number | null
          full_name: string
          gender?: string | null
          goals_dreams?: string | null
          group_subjects: string
          guardian_details?: string | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          high_school_studied: string
          id?: string
          ifsc_code: string
          is_spotlight_eligible?: boolean | null
          mandal: string
          mother_mobile?: string | null
          mother_name: string
          mother_occupation?: string | null
          phone: string
          pincode: string
          previous_application_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          spotlight_annual_need?: number | null
          spotlight_enabled?: boolean | null
          spotlight_enabled_at?: string | null
          spotlight_order?: number | null
          spotlight_story?: string | null
          ssc_max_marks: number
          ssc_percentage: number
          ssc_total_marks: number
          status?: string
          student_id: string
          study_activities?: string | null
          updated_at?: string | null
          village: string
        }
        Update: {
          academic_year?: string
          additional_info?: string | null
          address?: string
          annual_family_income?: string | null
          application_id?: string
          application_type?: string
          bank_account_number?: string
          bank_name_branch?: string
          college_address?: string
          college_admitted?: string | null
          course_joined?: string | null
          course_studying?: string | null
          created_at?: string | null
          current_college?: string | null
          date_of_admission?: string | null
          date_of_birth?: string
          district?: string
          email?: string
          family_adults_count?: number | null
          family_children_count?: number | null
          father_mobile?: string | null
          father_name?: string
          father_occupation?: string | null
          first_year_max_marks?: number | null
          first_year_percentage?: number | null
          first_year_total_marks?: number | null
          full_name?: string
          gender?: string | null
          goals_dreams?: string | null
          group_subjects?: string
          guardian_details?: string | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          high_school_studied?: string
          id?: string
          ifsc_code?: string
          is_spotlight_eligible?: boolean | null
          mandal?: string
          mother_mobile?: string | null
          mother_name?: string
          mother_occupation?: string | null
          phone?: string
          pincode?: string
          previous_application_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          spotlight_annual_need?: number | null
          spotlight_enabled?: boolean | null
          spotlight_enabled_at?: string | null
          spotlight_order?: number | null
          spotlight_story?: string | null
          ssc_max_marks?: number
          ssc_percentage?: number
          ssc_total_marks?: number
          status?: string
          student_id?: string
          study_activities?: string | null
          updated_at?: string | null
          village?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_previous_application_id_fkey"
            columns: ["previous_application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          currency: string | null
          donation_id: string
          donor_email: string
          donor_name: string
          donor_phone: string
          id: string
          notes: string | null
          payment_method: string | null
          status: string
          transaction_reference: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          currency?: string | null
          donation_id: string
          donor_email: string
          donor_name: string
          donor_phone: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          currency?: string | null
          donation_id?: string
          donor_email?: string
          donor_name?: string
          donor_phone?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          body: string
          error_message: string | null
          id: string
          recipient_email: string
          recipient_name: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          resend_id: string | null
          sent_at: string | null
          sent_by: string | null
          status: string
          subject: string
          template_name: string | null
        }
        Insert: {
          body: string
          error_message?: string | null
          id?: string
          recipient_email: string
          recipient_name?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resend_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject: string
          template_name?: string | null
        }
        Update: {
          body?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resend_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject?: string
          template_name?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          created_at: string | null
          display_name: string
          id: string
          is_enabled: boolean | null
          name: string
          subject: string
          updated_at: string | null
          updated_by: string | null
          variables: string[] | null
        }
        Insert: {
          body: string
          created_at?: string | null
          display_name: string
          id?: string
          is_enabled?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
          updated_by?: string | null
          variables?: string[] | null
        }
        Update: {
          body?: string
          created_at?: string | null
          display_name?: string
          id?: string
          is_enabled?: boolean | null
          name?: string
          subject?: string
          updated_at?: string | null
          updated_by?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      help_interests: {
        Row: {
          created_at: string | null
          email: string
          followed_up_at: string | null
          followed_up_by: string | null
          help_type: string
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string
          status: string
          student_id: string | null
          student_name: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          followed_up_at?: string | null
          followed_up_by?: string | null
          help_type: string
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone: string
          status?: string
          student_id?: string | null
          student_name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          followed_up_at?: string | null
          followed_up_by?: string | null
          help_type?: string
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string
          status?: string
          student_id?: string | null
          student_name?: string | null
        }
        Relationships: []
      }
      spotlight_applications: {
        Row: {
          annual_family_income: string | null
          annual_financial_need: number
          background_story: string
          circumstances: Json | null
          circumstances_other: string | null
          college_name: string
          competitive_exams: Json | null
          course_stream: string
          created_at: string | null
          current_status: string
          date_of_birth: string
          district: string
          dreams_goals: string
          email: string
          father_health: string | null
          father_name: string | null
          father_occupation: string | null
          featured_at: string | null
          featured_order: number | null
          full_name: string
          gender: string | null
          guardian_details: string | null
          guardian_name: string | null
          guardian_relationship: string | null
          how_help_changes_life: string
          id: string
          is_featured: boolean | null
          mandal: string
          max_marks: number
          mother_health: string | null
          mother_name: string | null
          mother_occupation: string | null
          parent_status: string
          percentage: number
          phone: string
          photo_url: string | null
          pincode: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          siblings_count: number | null
          spotlight_id: string
          state: string
          status: string
          student_id: string
          total_marks: number
          updated_at: string | null
          village: string
          year_of_completion: number
        }
        Insert: {
          annual_family_income?: string | null
          annual_financial_need: number
          background_story: string
          circumstances?: Json | null
          circumstances_other?: string | null
          college_name: string
          competitive_exams?: Json | null
          course_stream: string
          created_at?: string | null
          current_status: string
          date_of_birth: string
          district: string
          dreams_goals: string
          email: string
          father_health?: string | null
          father_name?: string | null
          father_occupation?: string | null
          featured_at?: string | null
          featured_order?: number | null
          full_name: string
          gender?: string | null
          guardian_details?: string | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          how_help_changes_life: string
          id?: string
          is_featured?: boolean | null
          mandal: string
          max_marks: number
          mother_health?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          parent_status: string
          percentage: number
          phone: string
          photo_url?: string | null
          pincode: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          siblings_count?: number | null
          spotlight_id: string
          state?: string
          status?: string
          student_id: string
          total_marks: number
          updated_at?: string | null
          village: string
          year_of_completion: number
        }
        Update: {
          annual_family_income?: string | null
          annual_financial_need?: number
          background_story?: string
          circumstances?: Json | null
          circumstances_other?: string | null
          college_name?: string
          competitive_exams?: Json | null
          course_stream?: string
          created_at?: string | null
          current_status?: string
          date_of_birth?: string
          district?: string
          dreams_goals?: string
          email?: string
          father_health?: string | null
          father_name?: string | null
          father_occupation?: string | null
          featured_at?: string | null
          featured_order?: number | null
          full_name?: string
          gender?: string | null
          guardian_details?: string | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          how_help_changes_life?: string
          id?: string
          is_featured?: boolean | null
          mandal?: string
          max_marks?: number
          mother_health?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          parent_status?: string
          percentage?: number
          phone?: string
          photo_url?: string | null
          pincode?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          siblings_count?: number | null
          spotlight_id?: string
          state?: string
          status?: string
          student_id?: string
          total_marks?: number
          updated_at?: string | null
          village?: string
          year_of_completion?: number
        }
        Relationships: [
          {
            foreignKeyName: "spotlight_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      spotlight_documents: {
        Row: {
          document_type: string
          file_name: string
          file_size: number
          id: string
          mime_type: string
          spotlight_application_id: string
          storage_path: string
          uploaded_at: string | null
        }
        Insert: {
          document_type: string
          file_name: string
          file_size: number
          id?: string
          mime_type: string
          spotlight_application_id: string
          storage_path: string
          uploaded_at?: string | null
        }
        Update: {
          document_type?: string
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string
          spotlight_application_id?: string
          storage_path?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spotlight_documents_spotlight_application_id_fkey"
            columns: ["spotlight_application_id"]
            isOneToOne: false
            referencedRelation: "spotlight_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          district: string | null
          email: string
          full_name: string | null
          gender: string | null
          id: string
          mandal: string | null
          phone: string | null
          pincode: string | null
          updated_at: string | null
          village: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          district?: string | null
          email: string
          full_name?: string | null
          gender?: string | null
          id: string
          mandal?: string | null
          phone?: string | null
          pincode?: string | null
          updated_at?: string | null
          village?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          district?: string | null
          email?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          mandal?: string | null
          phone?: string | null
          pincode?: string | null
          updated_at?: string | null
          village?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_application_id: { Args: Record<string, never>; Returns: string }
      generate_donation_id: { Args: Record<string, never>; Returns: string }
      generate_spotlight_id: { Args: Record<string, never>; Returns: string }
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenient type aliases
export type Student = Tables<'students'>
export type StudentInsert = TablesInsert<'students'>
export type StudentUpdate = TablesUpdate<'students'>

export type Application = Tables<'applications'>
export type ApplicationInsert = TablesInsert<'applications'>
export type ApplicationUpdate = TablesUpdate<'applications'>

export type ApplicationDocument = Tables<'application_documents'>
export type ApplicationDocumentInsert = TablesInsert<'application_documents'>

export type Donation = Tables<'donations'>
export type DonationInsert = TablesInsert<'donations'>

export type HelpInterest = Tables<'help_interests'>
export type HelpInterestInsert = TablesInsert<'help_interests'>

export type AdminActivityLog = Tables<'admin_activity_log'>
export type AdminActivityLogInsert = TablesInsert<'admin_activity_log'>

export type Admin = Tables<'admins'>
export type AdminInsert = TablesInsert<'admins'>

export type SpotlightApplication = Tables<'spotlight_applications'>
export type SpotlightApplicationInsert = TablesInsert<'spotlight_applications'>
export type SpotlightApplicationUpdate = TablesUpdate<'spotlight_applications'>

export type SpotlightDocument = Tables<'spotlight_documents'>
export type SpotlightDocumentInsert = TablesInsert<'spotlight_documents'>

export type EmailTemplate = Tables<'email_templates'>
export type EmailTemplateInsert = TablesInsert<'email_templates'>
export type EmailTemplateUpdate = TablesUpdate<'email_templates'>

export type EmailLog = Tables<'email_logs'>
export type EmailLogInsert = TablesInsert<'email_logs'>

// Enum-like types
export type ApplicationType = 'first-year' | 'second-year'
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_info'
export type SpotlightStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_info'
export type DonationStatus = 'pending' | 'confirmed' | 'completed' | 'failed' | 'refunded'
export type HelpType = 'donate' | 'volunteer' | 'corporate' | 'other'
export type HelpInterestStatus = 'new' | 'contacted' | 'converted' | 'closed'
export type Gender = 'male' | 'female'
export type IncomeRange = 'below-1-lakh' | '1-2-lakhs' | '2-3-lakhs' | '3-5-lakhs' | 'above-5-lakhs'
export type AdminRole = 'admin' | 'super_admin'
export type ParentStatus = 'both_alive' | 'single_parent_father' | 'single_parent_mother' | 'orphan'
export type CurrentStatus = 'studying' | 'seeking_admission' | 'working' | 'other'
export type EmailStatus = 'pending' | 'sent' | 'failed'

export type DocumentType =
  | 'ssc_marksheet'
  | 'aadhar_student'
  | 'aadhar_parent'
  | 'bonafide_certificate'
  | 'bank_passbook'
  | 'first_year_marksheet'
  | 'mango_plant_photo'
  | 'student_photo'

export type SpotlightDocumentType =
  | 'photo'
  | 'marksheet'
  | 'aadhar'
  | 'income_certificate'
  | 'other'

// Circumstance options for spotlight applications
export type CircumstanceOption =
  | 'single_parent'
  | 'orphan'
  | 'parent_disability'
  | 'parent_chronic_illness'
  | 'family_debt'
  | 'natural_disaster'
  | 'first_generation'
  | 'below_poverty_line'
  | 'no_stable_income'
  | 'other'

// Competitive exam type
export interface CompetitiveExam {
  exam: string
  score?: string
  rank?: number
  percentile?: number
}
