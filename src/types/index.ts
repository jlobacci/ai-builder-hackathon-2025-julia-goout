/**
 * Shared TypeScript types for the goOut application
 * Centralizes common interfaces to avoid duplication and ensure consistency
 */

export interface Profile {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_url?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  verified?: boolean | null;
  created_at?: string;
  radius_km?: number | null;
  other_hobbies?: string | null;
  lat?: number | null;
  lng?: number | null;
  contact_whatsapp?: string | null;
  cpf?: string | null;
}

export interface Hobby {
  id: number;
  name: string;
  slug: string;
}

export interface UserHobby {
  hobby_id: number;
  user_id: string;
  level?: string;
  hobbies?: Hobby;
}

export interface TimeSlot {
  id?: number;
  date: string;
  start_time: string;
  end_time: string;
}

export interface Invite {
  id: number;
  title: string;
  description?: string | null;
  author_id: string;
  hobby_id?: number | null;
  custom_hobby?: string | null;
  mode?: string | null;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
  radius_km?: number | null;
  time_window?: string | null;
  time_label?: string | null;
  time_is_fixed?: boolean;
  materials?: string | null;
  bring_own_materials?: boolean;
  slots?: number | null;
  slots_taken?: number | null;
  payment_type?: string;
  price?: number | null;
  created_at?: string;
  profiles?: Profile;
  hobbies?: Hobby;
}

export interface Application {
  id: number;
  applicant_id: string;
  invite_id?: number | null;
  message?: string | null;
  status?: string;
  created_at?: string;
  profiles?: Profile;
  invites?: Invite;
}

export interface Connection {
  id: number;
  requester_id: string;
  target_id: string;
  status: string;
  created_at?: string;
}

export interface PostImage {
  id: number;
  url: string;
  post_id: number;
  created_at?: string;
}

export interface PostMention {
  id: number;
  mentioned_user_id: string;
  post_id: number;
  profiles?: Profile;
}

export interface PostCounts {
  likes_count: number;
  comments_count: number;
  post_id?: number;
}

export interface Post {
  id: number;
  author_id: string;
  body?: string | null;
  created_at: string;
  profiles?: Profile;
  post_images?: PostImage[];
  post_mentions?: PostMention[];
  v_posts_counts?: PostCounts[];
  user_liked?: boolean;
}

export interface PostComment {
  id: number;
  post_id: number;
  author_id: string;
  body: string;
  created_at: string;
  profiles?: Profile;
}

export interface Message {
  id: number;
  body: string;
  sender_id: string;
  invite_id?: number | null;
  created_at: string;
  profiles?: Profile;
}

export interface DMThread {
  id: number;
  user_a: string;
  user_b: string;
  created_at: string;
}

export interface DMMessage {
  id: number;
  thread_id: number;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Review {
  id: number;
  reviewer_id: string;
  reviewee_id: string;
  stars: number;
  body?: string | null;
  created_at?: string;
  profiles?: Profile;
}
