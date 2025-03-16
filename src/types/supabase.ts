
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
