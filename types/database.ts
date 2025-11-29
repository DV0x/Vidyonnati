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

// Enum-like types
export type ApplicationType = 'first-year' | 'second-year'
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_info'
export type DonationStatus = 'pending' | 'confirmed' | 'completed' | 'failed' | 'refunded'
export type HelpType = 'donate' | 'volunteer' | 'corporate' | 'other'
export type HelpInterestStatus = 'new' | 'contacted' | 'converted' | 'closed'
export type Gender = 'male' | 'female'
export type IncomeRange = 'below-1-lakh' | '1-2-lakhs' | '2-3-lakhs' | '3-5-lakhs' | 'above-5-lakhs'

export type DocumentType =
  | 'ssc_marksheet'
  | 'aadhar_student'
  | 'aadhar_parent'
  | 'bonafide_certificate'
  | 'bank_passbook'
  | 'first_year_marksheet'
  | 'mango_plant_photo'
