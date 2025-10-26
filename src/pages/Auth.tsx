import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
});

const signUpSchema = authSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check for existing session and warn user
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        toast.info('Você já está logado. Para criar uma nova conta, clique em "Trocar de conta" primeiro.');
      }
    };
    checkExistingSession();
  }, []);

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
      authSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast.error('E-mail ou senha incorretos.');
      setLoading(false);
      return;
    }

    // After successful login, check profile and redirect
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!profile) {
        navigate('/onboarding');
      } else {
        navigate('/outs');
      }
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      signUpSchema.parse({ email, password, confirmPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`
      }
    });

    if (error) {
      toast.error('Não foi possível criar a conta. Verifique seus dados e tente novamente.');
      setLoading(false);
      return;
    }

    // Check if user was created successfully
    if (data.user) {
      toast.success('Conta criada com sucesso! Redirecionando...');
      // Redirect to onboarding after successful signup
      setTimeout(() => {
        navigate('/onboarding');
      }, 1000);
    } else {
      toast.error('Erro ao criar conta. Tente novamente.');
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-end">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={async () => {
                  await supabase.auth.signOut({ scope: 'global' });
                  try {
                    localStorage.removeItem('supabase.auth.token');
                    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
                    if (projectId) {
                      localStorage.removeItem(`sb-${projectId}-auth-token`);
                    }
                  } catch (error) {
                    console.error('Error clearing tokens:', error);
                  }
                  localStorage.clear();
                  sessionStorage.clear();
                  toast.success('Sessão encerrada. Você pode fazer login com outra conta.');
                  // Reload the page to clear all state
                  window.location.reload();
                }}
                className="text-[#6F6F6F] hover:text-[#B6463A]"
              >
                Trocar de conta
              </Button>
              <Button
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-[#6F6F6F] hover:text-[#B6463A]"
              >
                Voltar ao site
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center flex flex-col items-center">
            <h2 className="text-3xl font-bold text-[#333333]">Let's go OUT!</h2>
            <p className="mt-2 text-[#6F6F6F]">
              Encontre amigos para fazer aquilo que move a vida
            </p>
          </div>

          <Tabs defaultValue="signin" className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-6">
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
                <div>
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#B6463A] hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#B6463A] hover:bg-[#A23F35]"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-6">
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
                <div>
                  <Input
                    type="password"
                    placeholder="Senha (mínimo 6 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Confirme a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#B6463A] hover:bg-[#A23F35]"
                  disabled={loading}
                >
                  {loading ? 'Criando conta...' : 'Criar conta'}
                </Button>
                <p className="text-xs text-center text-[#6F6F6F] mt-4">
                  Ao criar sua conta, você concorda com nossos{' '}
                  <a href="/terms" className="text-[#B6463A] hover:underline">Termos de Uso</a>
                  {' '}e{' '}
                  <a href="/privacy" className="text-[#B6463A] hover:underline">Política de Privacidade</a>.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>E-mail enviado!</AlertDialogTitle>
            <AlertDialogDescription>
              Um e-mail com instruções para redefinir sua senha foi enviado para o endereço cadastrado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowForgotPassword(false)}>
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Auth;
