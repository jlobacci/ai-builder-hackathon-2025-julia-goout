import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle, MessageSquare, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const About: React.FC = () => {
  const { toast } = useToast();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + images.length > 5) {
      toast({
        title: "Limite de imagens",
        description: "Você pode anexar no máximo 5 imagens.",
        variant: "destructive"
      });
      return;
    }
    
    setImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, escreva uma mensagem antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsContactOpen(false);
    setMessage("");
    setImages([]);
    
    toast({
      title: "Mensagem enviada!",
      description: "Nossa equipe recebeu sua mensagem e entrará em contato em breve.",
    });
  };

  const handleCancel = () => {
    setIsContactOpen(false);
    setMessage("");
    setImages([]);
  };

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

        {/* Contact Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => setIsContactOpen(true)}
            size="lg"
            className="gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Entrar em contato
          </Button>
        </div>

        {/* Contact Dialog */}
        <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Entrar em contato</DialogTitle>
              <DialogDescription>
                Envie sua mensagem para nossa equipe de segurança. Responderemos em breve.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Descreva sua dúvida ou preocupação sobre segurança..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Imagens (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Anexar imagens
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {images.length > 0 && `${images.length} ${images.length === 1 ? 'imagem' : 'imagens'} selecionada${images.length === 1 ? '' : 's'}`}
                  </span>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar mensagem"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default About;
