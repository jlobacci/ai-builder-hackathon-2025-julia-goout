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

    // Cria usuário automaticamente sem verificação de email
    const randomPassword = Math.random().toString(36).slice(-16);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: randomPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        data: {
          auto_created: true,
        },
      },
    });

    if (error && error.message.includes('already registered')) {
      // Se já existe, faz login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: randomPassword,
      });
      
      if (signInError) {
        // Tenta criar com nova senha
        const newPassword = Math.random().toString(36).slice(-16);
        await supabase.auth.signUp({
          email,
          password: newPassword,
        });
      }
    } else if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate('/onboarding');
  };


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
