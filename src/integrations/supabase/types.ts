export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applicant_id: string | null
          created_at: string | null
          id: number
          invite_id: number | null
          message: string | null
          status: string | null
        }
        Insert: {
          applicant_id?: string | null
          created_at?: string | null
          id?: number
          invite_id?: number | null
          message?: string | null
          status?: string | null
        }
        Update: {
          applicant_id?: string | null
          created_at?: string | null
          id?: number
          invite_id?: number | null
          message?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "applications_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "v_invite_threads"
            referencedColumns: ["invite_id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string | null
          id: number
          requester_id: string
          status: string
          target_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          requester_id: string
          status?: string
          target_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          requester_id?: string
          status?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "connections_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "connections_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "connections_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      dm_messages: {
        Row: {
          body: string
          created_at: string
          id: number
          sender_id: string
          thread_id: number
        }
        Insert: {
          body: string
          created_at?: string
          id?: never
          sender_id: string
          thread_id: number
        }
        Update: {
          body?: string
          created_at?: string
          id?: never
          sender_id?: string
          thread_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "dm_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "dm_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "v_dm_threads_for_user"
            referencedColumns: ["thread_id"]
          },
        ]
      }
      dm_reads: {
        Row: {
          message_id: number
          read_at: string
          user_id: string
        }
        Insert: {
          message_id: number
          read_at?: string
          user_id: string
        }
        Update: {
          message_id?: number
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dm_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "dm_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "v_dm_threads_for_user"
            referencedColumns: ["last_message_id"]
          },
        ]
      }
      dm_threads: {
        Row: {
          created_at: string
          id: number
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: never
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: never
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      hobbies: {
        Row: {
          id: number
          name: string
          slug: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      invite_slots: {
        Row: {
          created_at: string | null
          date: string
          end_time: string
          id: number
          invite_id: number | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time: string
          id?: number
          invite_id?: number | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string
          id?: number
          invite_id?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_slots_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_slots_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "v_invite_threads"
            referencedColumns: ["invite_id"]
          },
        ]
      }
      invites: {
        Row: {
          author_id: string | null
          bring_own_materials: boolean | null
          city: string | null
          created_at: string | null
          custom_hobby: string | null
          description: string | null
          hobby_id: number | null
          id: number
          lat: number | null
          lng: number | null
          materials: string | null
          mode: string | null
          radius_km: number | null
          slots: number | null
          slots_taken: number | null
          time_is_fixed: boolean | null
          time_label: string | null
          time_window: string | null
          title: string
        }
        Insert: {
          author_id?: string | null
          bring_own_materials?: boolean | null
          city?: string | null
          created_at?: string | null
          custom_hobby?: string | null
          description?: string | null
          hobby_id?: number | null
          id?: number
          lat?: number | null
          lng?: number | null
          materials?: string | null
          mode?: string | null
          radius_km?: number | null
          slots?: number | null
          slots_taken?: number | null
          time_is_fixed?: boolean | null
          time_label?: string | null
          time_window?: string | null
          title: string
        }
        Update: {
          author_id?: string | null
          bring_own_materials?: boolean | null
          city?: string | null
          created_at?: string | null
          custom_hobby?: string | null
          description?: string | null
          hobby_id?: number | null
          id?: number
          lat?: number | null
          lng?: number | null
          materials?: string | null
          mode?: string | null
          radius_km?: number | null
          slots?: number | null
          slots_taken?: number | null
          time_is_fixed?: boolean | null
          time_label?: string | null
          time_window?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invites_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invites_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invites_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reads: {
        Row: {
          message_id: number
          read_at: string | null
          user_id: string
        }
        Insert: {
          message_id: number
          read_at?: string | null
          user_id: string
        }
        Update: {
          message_id?: number
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          id: number
          invite_id: number | null
          sender_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: number
          invite_id?: number | null
          sender_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: number
          invite_id?: number | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "v_invite_threads"
            referencedColumns: ["invite_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string | null
          id: number
          post_id: number
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string | null
          id?: number
          post_id: number
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string | null
          id?: number
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "v_posts_counts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      post_images: {
        Row: {
          created_at: string | null
          id: number
          post_id: number
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          post_id: number
          url: string
        }
        Update: {
          created_at?: string | null
          id?: number
          post_id?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "v_posts_counts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          post_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          post_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "v_posts_counts"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_mentions: {
        Row: {
          created_at: string | null
          id: number
          mentioned_user_id: string
          post_id: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          mentioned_user_id: string
          post_id: number
        }
        Update: {
          created_at?: string | null
          id?: number
          mentioned_user_id?: string
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_mentions_mentioned_user_id_fkey"
            columns: ["mentioned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_mentions_mentioned_user_id_fkey"
            columns: ["mentioned_user_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_mentions_mentioned_user_id_fkey"
            columns: ["mentioned_user_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_mentions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_mentions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "v_posts_counts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          body: string | null
          created_at: string | null
          id: number
        }
        Insert: {
          author_id: string
          body?: string | null
          created_at?: string | null
          id?: number
        }
        Update: {
          author_id?: string
          body?: string | null
          created_at?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          contact_whatsapp: string | null
          country: string | null
          cpf: string | null
          created_at: string | null
          display_name: string
          handle: string
          lat: number | null
          lng: number | null
          other_hobbies: string | null
          radius_km: number | null
          state: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          cpf?: string | null
          created_at?: string | null
          display_name: string
          handle: string
          lat?: number | null
          lng?: number | null
          other_hobbies?: string | null
          radius_km?: number | null
          state?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          cpf?: string | null
          created_at?: string | null
          display_name?: string
          handle?: string
          lat?: number | null
          lng?: number | null
          other_hobbies?: string | null
          radius_km?: number | null
          state?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string | null
          id: number
          reviewee_id: string
          reviewer_id: string
          stars: number
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: number
          reviewee_id: string
          reviewer_id: string
          stars: number
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: number
          reviewee_id?: string
          reviewer_id?: string
          stars?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_hobbies: {
        Row: {
          hobby_id: number
          level: string | null
          user_id: string
        }
        Insert: {
          hobby_id: number
          level?: string | null
          user_id: string
        }
        Update: {
          hobby_id?: number
          level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_hobbies_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_hobbies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_hobbies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_hobbies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_notification_state: {
        Row: {
          last_seen_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          last_seen_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          last_seen_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_dm_threads_for_user: {
        Row: {
          last_message_at: string | null
          last_message_body: string | null
          last_message_id: number | null
          last_message_sender_id: string | null
          other_avatar: string | null
          other_display_name: string | null
          other_handle: string | null
          other_user_id: string | null
          thread_created_at: string | null
          thread_id: number | null
          unread_count_for_me: number | null
          user_a: string | null
          user_b: string | null
        }
        Relationships: []
      }
      v_invite_threads: {
        Row: {
          author_id: string | null
          invite_id: number | null
          last_message_at: string | null
          last_message_body: string | null
          last_message_id: number | null
          last_message_sender_id: string | null
          title: string | null
        }
        Insert: {
          author_id?: string | null
          invite_id?: number | null
          last_message_at?: never
          last_message_body?: never
          last_message_id?: never
          last_message_sender_id?: never
          title?: string | null
        }
        Update: {
          author_id?: string | null
          invite_id?: number | null
          last_message_at?: never
          last_message_body?: never
          last_message_id?: never
          last_message_sender_id?: never
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invites_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invites_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_people_threads: {
        Row: {
          last_invite_id: number | null
          last_message_at: string | null
          last_message_body: string | null
          last_message_sender_id: string | null
          person_avatar: string | null
          person_id: string | null
          person_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["last_message_sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["last_message_sender_id"]
            isOneToOne: false
            referencedRelation: "v_profile_ratings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["last_message_sender_id"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_posts_counts: {
        Row: {
          comments_count: number | null
          likes_count: number | null
          post_id: number | null
        }
        Insert: {
          comments_count?: never
          likes_count?: never
          post_id?: number | null
        }
        Update: {
          comments_count?: never
          likes_count?: never
          post_id?: number | null
        }
        Relationships: []
      }
      v_profile_ratings: {
        Row: {
          avg_stars: number | null
          reviews_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          handle: string | null
          other_hobbies: string | null
          radius_km: number | null
          state: string | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          handle?: string | null
          other_hobbies?: string | null
          radius_km?: number | null
          state?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          handle?: string | null
          other_hobbies?: string | null
          radius_km?: number | null
          state?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      validate_cpf: { Args: { cpf_input: string }; Returns: boolean }
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
