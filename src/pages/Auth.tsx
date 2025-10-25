import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
});

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkProfileAndRedirect();
    }
  }, [user]);

  const checkProfileAndRedirect = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      navigate('/onboarding');
    } else {
      navigate('/outs');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse({ email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    const redirectUrl = `${window.location.origin}/auth`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      setEmailSent(true);
      toast.success('Link mágico enviado! Verifique seu e-mail.');
    }

    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <Logo size="lg" />
            <h2 className="mt-6 text-3xl font-bold">Verifique seu e-mail</h2>
            <p className="mt-2 text-muted-foreground">
              Enviamos um link de acesso para <strong>{email}</strong>
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Clique no link para entrar na plataforma.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Logo size="lg" />
          <h2 className="mt-6 text-3xl font-bold">Let's go OUT!</h2>
          <p className="mt-2 text-muted-foreground">
            Encontre amigos para fazer aquilo que move a vida
          </p>
        </div>

        <form onSubmit={handleSignIn} className="mt-8 space-y-6">
          <div>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full btn-primary"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Entrar com e-mail'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
