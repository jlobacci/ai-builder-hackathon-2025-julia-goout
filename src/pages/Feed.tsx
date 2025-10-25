import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Heart, MessageCircle, ImagePlus, X, Loader2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SecureImage } from '@/components/SecureImage';
import { z } from 'zod';

const postSchema = z.object({
  body: z.string().max(5000, 'Post deve ter no máximo 5000 caracteres').optional(),
});

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

interface Post {
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

interface Comment {
  id: number;
  post_id: number;
  author_id: string;
  body: string;
  created_at: string;
  profiles?: Profile;
}

const Feed: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerBody, setComposerBody] = useState('');
  const [composerImages, setComposerImages] = useState<File[]>([]);
  const [composerMentions, setComposerMentions] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [mentionPopoverOpen, setMentionPopoverOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingBody, setEditingBody] = useState('');
  const [editingMentions, setEditingMentions] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadPosts();
    loadProfiles();
    setupRealtimeSubscriptions();
  }, [user]);

  const loadProfiles = async () => {
    const { data } = await supabase
      .from('v_public_profiles')
      .select('user_id, display_name, handle, avatar_url')
      .order('display_name');
    if (data) setProfiles(data);
  };

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts' as any)
      .select(`
        *,
        profiles!posts_author_id_fkey(user_id, display_name, handle, avatar_url),
        post_images(id, url),
        post_mentions(id, mentioned_user_id, profiles!post_mentions_mentioned_user_id_fkey(user_id, display_name, handle))
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading posts:', error);
      toast({ title: 'Erro ao carregar posts', variant: 'destructive' });
    } else if (data) {
      // Load counts and like status
      const enrichedPosts = await Promise.all(
        data.map(async (post: any) => {
          const { data: counts } = await supabase
            .from('v_posts_counts' as any)
            .select('*')
            .eq('post_id', post.id)
            .single();

          const { data: likeData } = await supabase
            .from('post_likes' as any)
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', user?.id)
            .maybeSingle();

          return {
            ...post,
            v_posts_counts: counts ? [counts] : [{ likes_count: 0, comments_count: 0 }],
            user_liked: !!likeData,
          } as Post;
        })
      );
      setPosts(enrichedPosts);
    }
    setLoading(false);
  };

  const setupRealtimeSubscriptions = () => {
    const likesChannel = supabase
      .channel('post-likes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        () => loadPosts()
      )
      .subscribe();

    const commentsChannel = supabase
      .channel('post-comments-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_comments' },
        (payload) => {
          const newComment = payload.new as Comment;
          loadCommentsForPost(newComment.post_id);
          loadPosts(); // Refresh to update comment counts
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (composerImages.length + files.length > 6) {
      toast({ title: 'Máximo de 6 imagens permitidas', variant: 'destructive' });
      return;
    }
    setComposerImages([...composerImages, ...files.slice(0, 6 - composerImages.length)]);
  };

  const removeImage = (index: number) => {
    setComposerImages(composerImages.filter((_, i) => i !== index));
  };

  const toggleMention = (userId: string) => {
    setComposerMentions(
      composerMentions.includes(userId)
        ? composerMentions.filter((id) => id !== userId)
        : [...composerMentions, userId]
    );
  };

  const handlePublish = async () => {
    if (!composerBody.trim() && composerImages.length === 0) {
      toast({ title: 'Adicione texto ou imagens', variant: 'destructive' });
      return;
    }

    // Validate post body length
    const validation = postSchema.safeParse({ body: composerBody });
    if (!validation.success) {
      toast({ 
        title: validation.error.errors[0].message, 
        variant: 'destructive' 
      });
      return;
    }

    setPublishing(true);
    try {
      // Create post
      const { data: newPost, error: postError } = await supabase
        .from('posts' as any)
        .insert({ author_id: user?.id, body: composerBody.trim() || null })
        .select()
        .single();

      if (postError) throw postError;

      const postId = (newPost as any)?.id;
      if (!postId) throw new Error('Post ID not returned');

      // Upload images and store file paths (not URLs)
      for (const image of composerImages) {
        const fileName = `${user?.id}/${Date.now()}-${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from('media-posts')
          .upload(fileName, image);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({ title: 'Falha ao enviar imagem.', variant: 'destructive' });
          continue;
        }

        // Store only the file path, not the full URL
        await supabase
          .from('post_images' as any)
          .insert({ post_id: postId, url: fileName });
      }

      // Insert mentions
      for (const mentionedUserId of composerMentions) {
        await supabase
          .from('post_mentions' as any)
          .insert({ post_id: postId, mentioned_user_id: mentionedUserId });
      }

      // Clear composer
      setComposerBody('');
      setComposerImages([]);
      setComposerMentions([]);
      toast({ title: 'Publicado com sucesso!' });
      loadPosts();
    } catch (error) {
      console.error('Error publishing:', error);
      toast({ title: 'Erro ao publicar', variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  const toggleLike = async (postId: number, currentlyLiked: boolean) => {
    try {
      if (currentlyLiked) {
        await supabase
          .from('post_likes' as any)
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user?.id);
      } else {
        await supabase
          .from('post_likes' as any)
          .insert({ post_id: postId, user_id: user?.id });
      }
      // Realtime will trigger reload
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({ title: 'Erro ao curtir', variant: 'destructive' });
    }
  };

  const loadCommentsForPost = async (postId: number) => {
    const { data, error } = await supabase
      .from('post_comments' as any)
      .select(`
        *,
        profiles!post_comments_author_id_fkey(user_id, display_name, handle, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading comments:', error);
    } else if (data) {
      setComments((prev) => ({ ...prev, [postId]: data as any[] }));
    }
  };

  const toggleCommentsPanel = async (postId: number) => {
    if (openComments === postId) {
      setOpenComments(null);
    } else {
      setOpenComments(postId);
      // Always load comments when opening
      await loadCommentsForPost(postId);
    }
  };

  const submitComment = async (postId: number) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      await supabase
        .from('post_comments' as any)
        .insert({ post_id: postId, author_id: user?.id, body: text });

      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      // Realtime will trigger update
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({ title: 'Erro ao comentar', variant: 'destructive' });
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta publicação?')) return;

    try {
      // Delete post (cascades will handle images, mentions, likes, comments)
      const { error } = await supabase
        .from('posts' as any)
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({ title: 'Publicação deletada com sucesso!' });
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: 'Erro ao deletar publicação', variant: 'destructive' });
    }
  };

  const openEditDialog = (post: Post) => {
    setEditingPost(post);
    setEditingBody(post.body || '');
    // Load current mentions
    const currentMentions = post.post_mentions?.map(m => m.mentioned_user_id) || [];
    setEditingMentions(currentMentions);
  };

  const toggleEditMention = (userId: string) => {
    setEditingMentions(
      editingMentions.includes(userId)
        ? editingMentions.filter((id) => id !== userId)
        : [...editingMentions, userId]
    );
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    try {
      // Update post body
      const { error: updateError } = await supabase
        .from('posts' as any)
        .update({ body: editingBody.trim() || null })
        .eq('id', editingPost.id);

      if (updateError) throw updateError;

      // Get current mentions
      const { data: currentMentions } = await supabase
        .from('post_mentions' as any)
        .select('mentioned_user_id')
        .eq('post_id', editingPost.id);

      const currentMentionIds = currentMentions?.map((m: any) => m.mentioned_user_id) || [];

      // Find mentions to add and remove
      const mentionsToAdd = editingMentions.filter(id => !currentMentionIds.includes(id));
      const mentionsToRemove = currentMentionIds.filter((id: string) => !editingMentions.includes(id));

      // Add new mentions
      if (mentionsToAdd.length > 0) {
        const newMentions = mentionsToAdd.map(userId => ({
          post_id: editingPost.id,
          mentioned_user_id: userId
        }));
        await supabase.from('post_mentions' as any).insert(newMentions);
      }

      // Remove old mentions
      if (mentionsToRemove.length > 0) {
        await supabase
          .from('post_mentions' as any)
          .delete()
          .eq('post_id', editingPost.id)
          .in('mentioned_user_id', mentionsToRemove);
      }

      toast({ title: 'Publicação editada com sucesso!' });
      setEditingPost(null);
      setEditingBody('');
      setEditingMentions([]);
      loadPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({ title: 'Erro ao editar publicação', variant: 'destructive' });
    }
  };

  const selectedProfiles = profiles.filter((p) => composerMentions.includes(p.user_id));

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Feed</h1>

        {/* Composer */}
        <Card className="border shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <Textarea
              placeholder="O que você está fazendo hoje?"
              value={composerBody}
              onChange={(e) => setComposerBody(e.target.value)}
              className="min-h-[100px] resize-none"
            />

            {composerImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {composerImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={URL.createObjectURL(img)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeImage(idx)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {selectedProfiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedProfiles.map((p) => (
                  <Badge key={p.user_id} variant="secondary" className="gap-1">
                    @{p.handle}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => toggleMention(p.user_id)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2 justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Imagens
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                </Button>

                <Popover open={mentionPopoverOpen} onOpenChange={setMentionPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      Marcar pessoas
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar pessoa..." />
                      <CommandEmpty>Nenhuma pessoa encontrada.</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-auto">
                        {profiles.map((profile) => (
                          <CommandItem
                            key={profile.user_id}
                            onSelect={() => toggleMention(profile.user_id)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={profile.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {profile.display_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{profile.display_name}</span>
                              <span className="text-xs text-muted-foreground">
                                @{profile.handle}
                              </span>
                            </div>
                            {composerMentions.includes(profile.user_id) && (
                              <span className="text-primary">✓</span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Button onClick={handlePublish} disabled={publishing} className="bg-primary hover:bg-primary-hover">
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publicar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feed */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : posts.length === 0 ? (
          <Card className="border shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              Seja o primeiro a publicar um Out que rolou!
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="border shadow-sm">
              <CardContent className="pt-6 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <Avatar 
                    className="h-10 w-10 avatar-clickable"
                    onClick={() => navigate(`/u/${post.profiles?.handle}`)}
                  >
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {post.profiles?.display_name[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span 
                        className="font-semibold cursor-pointer hover:underline"
                        onClick={() => navigate(`/u/${post.profiles?.handle}`)}
                      >
                        {post.profiles?.display_name}
                      </span>
                      <span
                        className="text-sm text-muted-foreground cursor-pointer hover:underline"
                        onClick={() => navigate(`/u/${post.profiles?.handle}`)}
                      >
                        @{post.profiles?.handle}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ·{' '}
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Post actions menu (only for post author) */}
                  {post.author_id === user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(post)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePost(post.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Body */}
                {post.body && (
                  <p className="text-foreground whitespace-pre-wrap">{post.body}</p>
                )}

                {/* Mentions */}
                {post.post_mentions && post.post_mentions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.post_mentions.map((mention) => (
                      <Badge
                        key={mention.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => navigate(`/u/${mention.profiles?.handle}`)}
                      >
                        @{mention.profiles?.handle || mention.profiles?.display_name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Images */}
                {post.post_images && post.post_images.length > 0 && (
                  <div
                    className={`grid gap-2 ${
                      post.post_images.length === 1
                        ? 'grid-cols-1'
                        : post.post_images.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-3'
                    }`}
                  >
                    {post.post_images.map((img) => (
                      <div
                        key={img.id}
                        className={`rounded-xl overflow-hidden bg-muted ${
                          post.post_images!.length === 1 ? 'w-full' : 'aspect-square'
                        }`}
                      >
                        <SecureImage
                          bucket="media-posts"
                          path={img.url}
                          alt=""
                          className={`w-full object-cover ${
                            post.post_images!.length === 1 ? 'max-h-[600px]' : 'h-full'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 pt-2 border-t">
                  <button
                    onClick={() => toggleLike(post.id, post.user_liked || false)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        post.user_liked ? 'fill-primary text-primary' : ''
                      }`}
                    />
                    <span className="text-sm">
                      {post.v_posts_counts?.[0]?.likes_count || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleCommentsPanel(post.id)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">
                      {post.v_posts_counts?.[0]?.comments_count || 0}
                    </span>
                  </button>
                </div>

                {/* Comments Panel */}
                {openComments === post.id && (
                  <div className="space-y-4 pt-4 border-t">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar 
                          className="h-8 w-8 avatar-clickable"
                          onClick={() => navigate(`/u/${comment.profiles?.handle}`)}
                        >
                          <AvatarImage src={comment.profiles?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {comment.profiles?.display_name[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span 
                              className="font-medium text-sm cursor-pointer hover:underline"
                              onClick={() => navigate(`/u/${comment.profiles?.handle}`)}
                            >
                              {comment.profiles?.display_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{comment.body}</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <Input
                        placeholder="Escreva um comentário..."
                        value={commentText[post.id] || ''}
                        onChange={(e) =>
                          setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            submitComment(post.id);
                          }
                        }}
                      />
                      <Button onClick={() => submitComment(post.id)} size="sm">
                        Comentar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Post Dialog */}
      <Dialog open={!!editingPost} onOpenChange={(open) => {
        if (!open) {
          setEditingPost(null);
          setEditingMentions([]);
        }
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar Publicação</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={editingBody}
              onChange={(e) => setEditingBody(e.target.value)}
              placeholder="O que você está fazendo hoje?"
              className="min-h-[150px]"
            />

            {/* Selected mentions display */}
            {editingMentions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profiles
                  .filter((p) => editingMentions.includes(p.user_id))
                  .map((p) => (
                    <Badge key={p.user_id} variant="secondary" className="gap-1">
                      @{p.handle}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleEditMention(p.user_id)}
                      />
                    </Badge>
                  ))}
              </div>
            )}

            {/* Mention selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Marcar pessoas
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar pessoa..." />
                  <CommandEmpty>Nenhuma pessoa encontrada.</CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-auto">
                    {profiles.map((profile) => (
                      <CommandItem
                        key={profile.user_id}
                        onSelect={() => toggleEditMention(profile.user_id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {profile.display_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{profile.display_name}</span>
                          <span className="text-xs text-muted-foreground">
                            @{profile.handle}
                          </span>
                        </div>
                        {editingMentions.includes(profile.user_id) && (
                          <span className="text-primary">✓</span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingPost(null);
              setEditingMentions([]);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePost} className="bg-primary hover:bg-primary-hover">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Feed;
