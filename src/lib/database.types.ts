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
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'founder' | 'talent'
          status: 'active' | 'pending' | 'suspended'
          avatar_url: string | null
          company: string | null
          phone: string | null
          address: string | null
          wallet_balance: number | null
          bio: string | null
          portfolio: Json | null
          rate_level: number | null
          skills: Json | null
          social_media: Json | null
          total_earnings: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'admin' | 'founder' | 'talent'
          status?: 'active' | 'pending' | 'suspended'
          avatar_url?: string | null
          company?: string | null
          phone?: string | null
          address?: string | null
          wallet_balance?: number | null
          bio?: string | null
          portfolio?: Json | null
          rate_level?: number | null
          skills?: Json | null
          social_media?: Json | null
          total_earnings?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'founder' | 'talent'
          status?: 'active' | 'pending' | 'suspended'
          avatar_url?: string | null
          company?: string | null
          phone?: string | null
          address?: string | null
          wallet_balance?: number | null
          bio?: string | null
          portfolio?: Json | null
          rate_level?: number | null
          skills?: Json | null
          social_media?: Json | null
          total_earnings?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      campaigns: {
        Row: {
          id: string
          founder_id: string
          title: string
          description: string
          product_name: string
          category: string
          duration: '30sec' | '1min' | '3min'
          product_images: Json | null
          rate_level: number
          media_type: 'image' | 'video' | 'both'
          budget: number
          price: number
          status: 'draft' | 'active' | 'paused' | 'completed' | 'rejected'
          deadline: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          founder_id: string
          title: string
          description: string
          product_name: string
          category: string
          duration: '30sec' | '1min' | '3min'
          product_images?: Json | null
          rate_level: number
          media_type: 'image' | 'video' | 'both'
          budget?: number
          price: number
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'rejected'
          deadline?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          founder_id?: string
          title?: string
          description?: string
          product_name?: string
          category?: string
          duration?: '30sec' | '1min' | '3min'
          product_images?: Json | null
          rate_level?: number
          media_type?: 'image' | 'video' | 'both'
          budget?: number
          price?: number
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'rejected'
          deadline?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      campaign_applications: {
        Row: {
          id: string
          campaign_id: string
          talent_id: string
          status: string | null
          applied_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          talent_id: string
          status?: string | null
          applied_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          talent_id?: string
          status?: string | null
          applied_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          campaign_id: string
          talent_id: string
          founder_id: string
          status: 'pending_shipment' | 'shipped' | 'delivered' | 'review_submitted' | 'completed'
          payout: number
          delivery_address: string | null
          tracking_number: string | null
          courier: string | null
          review_media_url: string | null
          review_media_type: 'image' | 'video' | 'both' | null
          review_submitted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          talent_id: string
          founder_id: string
          status?: 'pending_shipment' | 'shipped' | 'delivered' | 'review_submitted' | 'completed'
          payout: number
          delivery_address?: string | null
          tracking_number?: string | null
          courier?: string | null
          review_media_url?: string | null
          review_media_type?: 'image' | 'video' | 'both' | null
          review_submitted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          talent_id?: string
          founder_id?: string
          status?: 'pending_shipment' | 'shipped' | 'delivered' | 'review_submitted' | 'completed'
          payout?: number
          delivery_address?: string | null
          tracking_number?: string | null
          courier?: string | null
          review_media_url?: string | null
          review_media_type?: 'image' | 'video' | 'both' | null
          review_submitted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'credit' | 'debit'
          amount: number
          description: string
          related_order_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'credit' | 'debit'
          amount: number
          description: string
          related_order_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'credit' | 'debit'
          amount?: number
          description?: string
          related_order_id?: string | null
          created_at?: string | null
        }
      }
      earnings: {
        Row: {
          id: string
          talent_id: string
          order_id: string
          campaign_title: string
          amount: number
          status: 'pending' | 'paid' | 'cancelled'
          earned_at: string | null
          paid_at: string | null
        }
        Insert: {
          id?: string
          talent_id: string
          order_id: string
          campaign_title: string
          amount: number
          status?: 'pending' | 'paid' | 'cancelled'
          earned_at?: string | null
          paid_at?: string | null
        }
        Update: {
          id?: string
          talent_id?: string
          order_id?: string
          campaign_title?: string
          amount?: number
          status?: 'pending' | 'paid' | 'cancelled'
          earned_at?: string | null
          paid_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          order_id: string
          sender_id: string
          content: string
          read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          sender_id: string
          content: string
          read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          sender_id?: string
          content?: string
          read?: boolean | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_campaign_price: {
        Args: {
          rate_level: number
          duration: '30sec' | '1min' | '3min'
        }
        Returns: number
      }
    }
    Enums: {
      user_role: 'admin' | 'founder' | 'talent'
      user_status: 'active' | 'pending' | 'suspended'
      campaign_status: 'draft' | 'active' | 'paused' | 'completed' | 'rejected'
      order_status: 'pending_shipment' | 'shipped' | 'delivered' | 'review_submitted' | 'completed'
      transaction_type: 'credit' | 'debit'
      earning_status: 'pending' | 'paid' | 'cancelled'
      media_type: 'image' | 'video' | 'both'
      duration_type: '30sec' | '1min' | '3min'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}