import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_POSTS, MOCK_PROFILES, MOCK_POST_COMMENTS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Heart, MessageCircle, ImagePlus, X, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { SecureImage } from '@/components/SecureImage';

const Feed: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [composerBody, setComposerBody] = useState('');
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, typeof MOCK_POST_COMMENTS>>({});

  if (!user) { navigate('/auth'); return null; }

  const handlePublish = () => {
    if (!composerBody.trim()) { toast({ title: 'Adicione texto', variant: 'destructive' }); return; }
    const profile = MOCK_PROFILES.find(p => p.user_id === user.id);
    const newPost = {
      id: Date.now(), author_id: user.id, body: composerBody.trim(), created_at: new Date().toISOString(),
      profiles: profile, post_images: [], post_mentions: [],
      v_posts_counts: [{ likes_count: 0, comments_count: 0 }], user_liked: false,
    };
    setPosts([newPost, ...posts]);
    setComposerBody('');
    toast({ title: 'Publicado com sucesso!' });
  };

  const toggleLike = (postId: number) => {
    setPosts(posts.map(p => p.id === postId ? {
      ...p, user_liked: !p.user_liked,
      v_posts_counts: [{ likes_count: (p.v_posts_counts?.[0]?.likes_count || 0) + (p.user_liked ? -1 : 1), comments_count: p.v_posts_counts?.[0]?.comments_count || 0 }]
    } : p));
  };

  const toggleComments = (postId: number) => {
    if (openComments === postId) { setOpenComments(null); return; }
    setOpenComments(postId);
    if (!comments[postId]) {
      setComments(prev => ({ ...prev, [postId]: MOCK_POST_COMMENTS.filter(c => c.post_id === postId) }));
    }
  };

  const submitComment = (postId: number) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    const profile = MOCK_PROFILES.find(p => p.user_id === user.id);
    const newComment = { id: Date.now(), post_id: postId, author_id: user.id, body: text, created_at: new Date().toISOString(), profiles: profile };
    setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }));
    setCommentText(prev => ({ ...prev, [postId]: '' }));
    setPosts(posts.map(p => p.id === postId ? { ...p, v_posts_counts: [{ likes_count: p.v_posts_counts?.[0]?.likes_count || 0, comments_count: (p.v_posts_counts?.[0]?.comments_count || 0) + 1 }] } : p));
  };

  const deletePost = (postId: number) => { if (confirm('Deletar esta publicação?')) setPosts(posts.filter(p => p.id !== postId)); };

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Feed</h1>
        <Card className="border shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <Textarea placeholder="O que você está fazendo hoje?" value={composerBody} onChange={(e) => setComposerBody(e.target.value)} className="min-h-[100px] resize-none" />
            <div className="flex justify-end">
              <Button onClick={handlePublish} className="bg-primary hover:bg-primary-hover">Publicar</Button>
            </div>
          </CardContent>
        </Card>

        {posts.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Seja o primeiro a publicar!</CardContent></Card>
        ) : posts.map((post) => (
          <Card key={post.id} className="border shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate(`/u/${post.profiles?.handle}`)}>
                  <AvatarImage src={post.profiles?.avatar_url} /><AvatarFallback className="bg-primary text-primary-foreground">{post.profiles?.display_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/u/${post.profiles?.handle}`)}>{post.profiles?.display_name}</span>
                    <span className="text-sm text-muted-foreground">@{post.profiles?.handle}</span>
                    <span className="text-sm text-muted-foreground">· {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}</span>
                  </div>
                </div>
                {post.author_id === user.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deletePost(post.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Deletar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {post.body && <p className="text-foreground whitespace-pre-wrap">{post.body}</p>}
              {post.post_mentions && post.post_mentions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.post_mentions.map((m: any) => <Badge key={m.id} variant="outline" className="cursor-pointer" onClick={() => navigate(`/u/${m.profiles?.handle}`)}>@{m.profiles?.handle}</Badge>)}
                </div>
              )}
              <div className="flex items-center gap-6 pt-2 border-t">
                <button onClick={() => toggleLike(post.id)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Heart className={`h-5 w-5 ${post.user_liked ? 'fill-primary text-primary' : ''}`} /><span className="text-sm">{post.v_posts_counts?.[0]?.likes_count || 0}</span>
                </button>
                <button onClick={() => toggleComments(post.id)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-5 w-5" /><span className="text-sm">{post.v_posts_counts?.[0]?.comments_count || 0}</span>
                </button>
              </div>
              {openComments === post.id && (
                <div className="space-y-4 pt-4 border-t">
                  {(comments[post.id] || []).map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8"><AvatarImage src={comment.profiles?.avatar_url} /><AvatarFallback className="text-xs">{comment.profiles?.display_name?.[0] || 'U'}</AvatarFallback></Avatar>
                      <div><span className="font-medium text-sm">{comment.profiles?.display_name}</span> <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}</span><p className="text-sm">{comment.body}</p></div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input placeholder="Escreva um comentário..." value={commentText[post.id] || ''} onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitComment(post.id); } }} />
                    <Button onClick={() => submitComment(post.id)} size="sm">Comentar</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default Feed;
