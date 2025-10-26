import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SecureImage } from '@/components/SecureImage';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Profile {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_url?: string;
}

interface PostImage {
  id: number;
  url: string;
}

interface PostMention {
  id: number;
  mentioned_user_id: string;
  profiles?: Profile;
}

export interface Post {
  id: number;
  author_id: string;
  body?: string;
  created_at: string;
  profiles?: Profile;
  post_images?: PostImage[];
  post_mentions?: PostMention[];
  v_posts_counts?: {
    likes_count: number;
    comments_count: number;
  }[];
  user_liked?: boolean;
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: number, currentlyLiked: boolean) => void;
  onComment: (postId: number) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: number) => void;
  commentsOpen?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onLike,
  onComment,
  onEdit,
  onDelete,
  commentsOpen = false,
}) => {
  const navigate = useNavigate();
  const isOwnPost = currentUserId === post.author_id;
  const likesCount = post.v_posts_counts?.[0]?.likes_count || 0;
  const commentsCount = post.v_posts_counts?.[0]?.comments_count || 0;

  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={() => navigate(`/profile/${post.profiles?.handle}`)}
          >
            <Avatar className="w-12 h-12 border">
              <AvatarImage src={post.profiles?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.profiles?.display_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{post.profiles?.display_name}</p>
              <p className="text-sm text-muted-foreground">
                @{post.profiles?.handle} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          </div>
          {isOwnPost && onEdit && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(post)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Body */}
        {post.body && <p className="whitespace-pre-wrap break-words">{post.body}</p>}

        {/* Mentions */}
        {post.post_mentions && post.post_mentions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.post_mentions.map((mention) => (
              <Badge
                key={mention.id}
                variant="secondary"
                className="cursor-pointer hover:bg-accent"
                onClick={() => navigate(`/profile/${mention.profiles?.handle}`)}
              >
                @{mention.profiles?.handle || 'unknown'}
              </Badge>
            ))}
          </div>
        )}

        {/* Images */}
        {post.post_images && post.post_images.length > 0 && (
          <div className={`grid gap-2 ${post.post_images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.post_images.map((img) => (
              <SecureImage
                key={img.id}
                bucket="media-posts"
                path={img.url}
                alt="Post image"
                className="w-full rounded-lg object-cover max-h-80"
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id, post.user_liked || false)}
            className={post.user_liked ? 'text-red-500 hover:text-red-600' : ''}
          >
            <Heart className={`w-5 h-5 mr-1.5 ${post.user_liked ? 'fill-current' : ''}`} />
            {likesCount > 0 && <span>{likesCount}</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment(post.id)}
            className={commentsOpen ? 'text-primary' : ''}
          >
            <MessageCircle className="w-5 h-5 mr-1.5" />
            {commentsCount > 0 && <span>{commentsCount}</span>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
