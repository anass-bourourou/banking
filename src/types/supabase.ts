
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: number
          name: string
          number: string
          balance: number
          currency: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          number: string
          balance: number
          currency: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          number?: string
          balance?: number
          currency?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      account_history: {
        Row: {
          id: number
          account_id: number
          month: string
          amount: number
        }
        Insert: {
          id?: number
          account_id: number
          month: string
          amount: number
        }
        Update: {
          id?: number
          account_id?: number
          month?: string
          amount?: number
        }
      }
      transactions: {
        Row: {
          id: number
          description: string
          amount: number
          type: 'credit' | 'debit'
          date: string
          account_id: number
          category?: string
          created_at: string
          recipient_name?: string
          recipient_account?: string
          transfer_type?: 'standard' | 'instant' | 'scheduled' | 'mass'
          status: 'completed' | 'pending' | 'failed'
          reference_id?: string
          fees?: number
        }
        Insert: {
          id?: number
          description: string
          amount: number
          type: 'credit' | 'debit'
          date: string
          account_id: number
          category?: string
          created_at?: string
          recipient_name?: string
          recipient_account?: string
          transfer_type?: 'standard' | 'instant' | 'scheduled' | 'mass'
          status?: 'completed' | 'pending' | 'failed'
          reference_id?: string
          fees?: number
        }
        Update: {
          id?: number
          description?: string
          amount?: number
          type?: 'credit' | 'debit'
          date?: string
          account_id?: number
          category?: string
          created_at?: string
          recipient_name?: string
          recipient_account?: string
          transfer_type?: 'standard' | 'instant' | 'scheduled' | 'mass'
          status?: 'completed' | 'pending' | 'failed'
          reference_id?: string
          fees?: number
        }
      }
      transfers: {
        Row: {
          id: number
          from_account_id: number
          to_account_id?: number
          beneficiary_id?: string
          amount: number
          description?: string
          date: string
          scheduled_date?: string
          is_instant: boolean
          is_recurring: boolean
          recurring_frequency?: string
          status: 'completed' | 'pending' | 'failed'
          fees?: number
          created_at: string
        }
        Insert: {
          id?: number
          from_account_id: number
          to_account_id?: number
          beneficiary_id?: string
          amount: number
          description?: string
          date: string
          scheduled_date?: string
          is_instant?: boolean
          is_recurring?: boolean
          recurring_frequency?: string
          status?: 'completed' | 'pending' | 'failed'
          fees?: number
          created_at?: string
        }
        Update: {
          id?: number
          from_account_id?: number
          to_account_id?: number
          beneficiary_id?: string
          amount?: number
          description?: string
          date?: string
          scheduled_date?: string
          is_instant?: boolean
          is_recurring?: boolean
          recurring_frequency?: string
          status?: 'completed' | 'pending' | 'failed'
          fees?: number
          created_at?: string
        }
      }
      beneficiaries: {
        Row: {
          id: string
          name: string
          iban: string
          bic?: string
          email?: string
          phone?: string
          user_id: string
          bank_name?: string
          address?: string
          favorite: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          iban: string
          bic?: string
          email?: string
          phone?: string
          user_id: string
          bank_name?: string
          address?: string
          favorite?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          iban?: string
          bic?: string
          email?: string
          phone?: string
          user_id?: string
          bank_name?: string
          address?: string
          favorite?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          type: 'info' | 'warning' | 'alert'
          date: string
          read: boolean
          user_id: string
          transaction_id?: number
          transfer_id?: number
        }
        Insert: {
          id?: string
          title: string
          message: string
          type: 'info' | 'warning' | 'alert'
          date: string
          read: boolean
          user_id: string
          transaction_id?: number
          transfer_id?: number
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: 'info' | 'warning' | 'alert'
          date?: string
          read?: boolean
          user_id?: string
          transaction_id?: number
          transfer_id?: number
        }
      }
      statements: {
        Row: {
          id: string
          account_id: number
          period: string
          date: string
          file_path?: string
          status: 'available' | 'processing'
          download_count: number
          created_at: string
        }
        Insert: {
          id?: string
          account_id: number
          period: string
          date: string
          file_path?: string
          status?: 'available' | 'processing'
          download_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: number
          period?: string
          date?: string
          file_path?: string
          status?: 'available' | 'processing'
          download_count?: number
          created_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          reference: string
          type: 'DGI' | 'CIM' | 'OTHER'
          amount: number
          dueDate: string
          status: 'pending' | 'paid'
          paymentDate?: string
          description: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          reference: string
          type: 'DGI' | 'CIM' | 'OTHER'
          amount: number
          dueDate: string
          status?: 'pending' | 'paid'
          paymentDate?: string
          description: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          reference?: string
          type?: 'DGI' | 'CIM' | 'OTHER'
          amount?: number
          dueDate?: string
          status?: 'pending' | 'paid'
          paymentDate?: string
          description?: string
          user_id?: string
          created_at?: string
        }
      }
      scheduled_transfers: {
        Row: {
          id: number
          from_account_id: number
          to_account_id?: number
          beneficiary_id?: string
          amount: number
          description?: string
          scheduled_date: string
          recurring: boolean
          frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          next_execution_date: string
          end_date?: string
          status: 'active' | 'paused' | 'completed' | 'cancelled'
          created_at: string
          user_id: string
        }
        Insert: {
          id?: number
          from_account_id: number
          to_account_id?: number
          beneficiary_id?: string
          amount: number
          description?: string
          scheduled_date: string
          recurring?: boolean
          frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          next_execution_date: string
          end_date?: string
          status?: 'active' | 'paused' | 'completed' | 'cancelled'
          created_at?: string
          user_id: string
        }
        Update: {
          id?: number
          from_account_id?: number
          to_account_id?: number
          beneficiary_id?: string
          amount?: number
          description?: string
          scheduled_date?: string
          recurring?: boolean
          frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          next_execution_date?: string
          end_date?: string
          status?: 'active' | 'paused' | 'completed' | 'cancelled'
          created_at?: string
          user_id?: string
        }
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
  }
}
