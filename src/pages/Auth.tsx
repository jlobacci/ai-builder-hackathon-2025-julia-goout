import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signIn } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn(email, password);

    if (result.success) {
      toast.success('Login realizado com sucesso!');
      navigate('/feed');
    } else {
      toast.error(result.error || 'E-mail ou senha incorretos.');
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Modo de apresentação: use julia@goout.com / goout2024');
  };

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-end">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-[#6F6F6F] hover:text-[#B6463A]"
            >
              Voltar ao site
            </Button>
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
                <Button
                  type="submit"
                  className="w-full bg-[#B6463A] hover:bg-[#A23F35]"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Demo: julia@goout.com / goout2024
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-6">
                <p className="text-center text-muted-foreground">
                  Modo de apresentação. Use as credenciais de demo para entrar.
                </p>
                <p className="text-sm text-center font-medium">
                  Email: julia@goout.com<br />
                  Senha: goout2024
                </p>
                <Button
                  type="button"
                  className="w-full bg-[#B6463A] hover:bg-[#A23F35]"
                  onClick={() => {
                    setEmail('julia@goout.com');
                    setPassword('goout2024');
                  }}
                >
                  Preencher credenciais
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
