import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Users, Activity, Shield, Camera, Lock } from 'lucide-react';
import { Logo } from '@/components/Logo';

const Index = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    'https://images.unsplash.com/photo-1741926677819-c7543a44d2f2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=680', // cycling
    'https://images.unsplash.com/photo-1739292774732-09443c4c9478?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170?w=800&h=600&fit=crop', // guitar
    'https://plus.unsplash.com/premium_photo-1713908274212-f96df661898f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170?w=800&h=600&fit=crop', // coffee
    'https://images.unsplash.com/photo-1710301431924-0e337943e0cd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626?w=800&h=600&fit=crop', // yoga
    'https://images.unsplash.com/photo-1624131929468-770a2689f4b9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1169?w=800&h=600&fit=crop', // studying
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo size="md" />
            <Button
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="border-[#B6463A] text-[#B6463A] hover:bg-[#FCE9E7]"
            >
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Text Column */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#333333]">
                Let's Go out!
              </h1>
              <h2 className="text-lg sm:text-xl text-[#6F6F6F] leading-relaxed">
                O app para quem quer viver mais, encontrar pessoas com os mesmos interesses, 
                aprender algo novo e se manter em movimento.
              </h2>
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-[#B6463A] hover:bg-[#A23F35] text-white text-base sm:text-lg px-8 py-6 w-full sm:w-auto"
                aria-label="Comece a se conectar agora"
              >
                ➡️ Teste agora e comece a se conectar
              </Button>
            </div>

            {/* Image Column */}
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-lg">
              {heroImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Pessoas conectadas - ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-8 sm:p-12 space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#333333]">
                  A vida não acontece só entre a casa e o trabalho.
                </h2>
                <div className="space-y-4 text-[#6F6F6F] text-base sm:text-lg max-w-4xl mx-auto">
                  <p>
                    A teoria do terceiro lugar fala sobre os espaços onde nos sentimos parte de algo: 
                    cafés, praças, parques, estúdios, quadras, livrarias. São esses lugares que despertam o convívio, a troca e a criatividade.
                  </p>
                  <p>
                    O GoOut nasceu para te tirar da rotina, te conectar com pessoas e te inspirar 
                    a ocupar a cidade com propósito.
                  </p>
                  <p className="font-semibold text-[#333333]">
                    Mais do que um app: um movimento para quem quer viver mais, aprender mais e se conectar de verdade.
                  </p>
                </div>
              </div>

              {/* Pillars */}
              <div className="grid gap-6 sm:gap-8 md:grid-cols-3 pt-8">
                <Card className="bg-[#F3F2EF] border-none">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white">
                      <Sparkles className="w-8 h-8 text-[#B6463A]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#333333]">Aprenda algo novo</h3>
                    <p className="text-[#6F6F6F]">
                      Oficinas, aulas e trocas culturais
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#F3F2EF] border-none">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white">
                      <Users className="w-8 h-8 text-[#B6463A]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#333333]">Conheça pessoas reais</h3>
                    <p className="text-[#6F6F6F]">
                      Conecte-se por afinidades, não por likes
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#F3F2EF] border-none">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white">
                      <Activity className="w-8 h-8 text-[#B6463A]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#333333]">Movimente-se</h3>
                    <p className="text-[#6F6F6F]">
                      Corpo e mente ativos, dentro e fora dos espaços comuns
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-8 sm:p-12 space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#333333]">
                  Conexões seguras, experiências reais.
                </h2>
                <p className="text-[#6F6F6F] text-lg max-w-2xl mx-auto">
                  Sua segurança é nossa prioridade. Cada encontro começa com confiança.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FCE9E7]">
                    <Shield className="w-7 h-7 text-[#B6463A]" />
                  </div>
                  <h3 className="font-bold text-[#333333]">Login com CPF</h3>
                  <p className="text-sm text-[#6F6F6F]">
                    Usado exclusivamente para checar antecedentes e garantir um ambiente seguro.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FCE9E7]">
                    <Camera className="w-7 h-7 text-[#B6463A]" />
                  </div>
                  <h3 className="font-bold text-[#333333]">Validação de fotos</h3>
                  <p className="text-sm text-[#6F6F6F]">
                    Imagens conferidas para garantir autenticidade.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FCE9E7]">
                    <Lock className="w-7 h-7 text-[#B6463A]" />
                  </div>
                  <h3 className="font-bold text-[#333333]">Proteção de dados</h3>
                  <p className="text-sm text-[#6F6F6F]">
                    Sua privacidade é prioridade.
                  </p>
                </div>
              </div>

              <p className="text-center text-[#6F6F6F] max-w-2xl mx-auto">
                Assim, você pode explorar a cidade e conhecer pessoas com tranquilidade — sabendo que 
                todo encontro começa de forma segura e verdadeira.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size="md" />
            <div className="flex flex-wrap gap-6 text-sm text-[#6F6F6F]">
              <a href="/privacy" className="hover:text-[#B6463A] transition-colors">
                Política de Privacidade
              </a>
              <a href="/terms" className="hover:text-[#B6463A] transition-colors">
                Termos de Uso
              </a>
              <a href="/contact" className="hover:text-[#B6463A] transition-colors">
                Contato
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-[#6F6F6F]">
            © 2025 Let's Go ou. Viver é sair. Conectar é o caminho.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
