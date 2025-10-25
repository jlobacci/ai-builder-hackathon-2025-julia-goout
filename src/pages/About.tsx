import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle } from "lucide-react";

const About: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sobre & Segurança</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Sobre o goOut</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-foreground leading-relaxed">
              O goOut conecta pessoas para fazer aquilo que realmente move a vida: praticar hobbies. Além do trabalho e
              da rotina, a felicidade está em viver. Encontre um hobbie, encontre um amigo, go out e viva a vida.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Dicas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[hsl(var(--success))] mt-0.5 flex-shrink-0" />
                <span>Combine o primeiro encontro em local público;</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[hsl(var(--success))] mt-0.5 flex-shrink-0" />
                <span>Avise alguém sobre o encontro;</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[hsl(var(--success))] mt-0.5 flex-shrink-0" />
                <span>Nunca compartilhe dados sensíveis no chat;</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[hsl(var(--success))] mt-0.5 flex-shrink-0" />
                <span>Confie nos seus instintos - se algo parecer estranho, cancele o encontro;</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[hsl(var(--success))] mt-0.5 flex-shrink-0" />
                <span>Prefira perfis verificados quando possível.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default About;
