import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";

const onboardingSchema = z.object({
  display_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  handle: z
    .string()
    .min(3, "Nickname deve ter pelo menos 3 caracteres")
    .regex(/^\S+$/, "Nickname não pode conter espaços"),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  cpf: z.string().optional(),
});

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    display_name: "",
    handle: "",
    country: "Brasil",
    state: "",
    city: "",
    bio: "",
    cpf: "",
    avatar_url: "",
  });

  React.useEffect(() => {
    loadHobbies();
  }, []);

  const loadHobbies = async () => {
    try {
      const { data, error } = await supabase.from("hobbies").select("*");
      if (error) {
        console.error("Erro ao carregar hobbies:", error);
        toast.error("Erro ao carregar hobbies");
        return;
      }
      if (data) {
        console.log("Hobbies carregados:", data);
        setHobbies(data);
      }
    } catch (error) {
      console.error("Erro inesperado ao carregar hobbies:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit chamado", formData);

    if (!formData.cpf) {
      setShowCpfModal(true);
      return;
    }

    await completeOnboarding();
  };

  const completeOnboarding = async (skipCpf = false) => {
    if (!user) {
      console.error("Usuário não autenticado");
      toast.error("Você precisa estar autenticado");
      return;
    }

    console.log("completeOnboarding chamado", { skipCpf, formData });

    try {
      const dataToValidate = skipCpf ? { ...formData, cpf: "" } : formData;
      onboardingSchema.parse(dataToValidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Erro de validação:", error.errors);
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      const profileData = {
        user_id: user.id,
        display_name: formData.display_name,
        handle: formData.handle,
        country: formData.country || "Brasil",
        state: formData.state,
        city: formData.city,
        bio: formData.bio,
        cpf: skipCpf ? null : formData.cpf || null,
        avatar_url: formData.avatar_url || null,
      };

      console.log("Inserindo perfil:", profileData);
      const { error: profileError } = await supabase.from("profiles").upsert(profileData);

      if (profileError) {
        console.error("Erro ao inserir perfil:", profileError);
        throw profileError;
      }

      // Insert user hobbies
      if (selectedHobbies.length > 0) {
        const userHobbiesData = selectedHobbies.map((hobbyId) => ({
          user_id: user.id,
          hobby_id: hobbyId,
          level: "iniciante",
        }));

        console.log("Inserindo hobbies do usuário:", userHobbiesData);
        const { error: hobbiesError } = await supabase.from("user_hobbies").insert(userHobbiesData);
        
        if (hobbiesError) {
          console.error("Erro ao inserir hobbies:", hobbiesError);
          // Não bloquear o fluxo se falhar os hobbies
        }
      }

      toast.success("Perfil criado com sucesso!");
      navigate("/outs");
    } catch (error: any) {
      console.error("Erro ao criar perfil:", error);
      toast.error(error.message || "Erro ao criar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithoutCpf = () => {
    setShowCpfModal(false);
    completeOnboarding(true);
  };

  const handleFinishNow = () => {
    setShowCpfModal(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Complete seu perfil</h1>
        <p className="text-muted-foreground mb-8">Preencha as informações para começar a usar o goOut</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="display_name">Nome *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="handle">Nickname (sem espaços) *</Label>
            <Input
              id="handle"
              value={formData.handle}
              onChange={(e) => setFormData({ ...formData, handle: e.target.value.replace(/\s/g, "") })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio curta</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="cpf">CPF (opcional)</Label>
            <Input id="cpf" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} />
            <p className="text-sm text-muted-foreground mt-1">CPF utilizado para verificação de segurança</p>
          </div>

          <div>
            <Label>Hobbies</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {hobbies.map((hobby) => (
                <div key={hobby.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={hobby.id}
                    checked={selectedHobbies.includes(hobby.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedHobbies([...selectedHobbies, hobby.id]);
                      } else {
                        setSelectedHobbies(selectedHobbies.filter((id) => id !== hobby.id));
                      }
                    }}
                  />
                  <Label htmlFor={hobby.id} className="cursor-pointer">
                    {hobby.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Concluir"}
          </Button>
        </form>
      </div>

      <Dialog open={showCpfModal} onOpenChange={setShowCpfModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificação por CPF</DialogTitle>
            <DialogDescription>
              O CPF é uma verificação de segurança. A disponibilização dele é opcional, porém necessária para algumas
              permissões dentro da plataforma. Você pode terminar sua verificação agora ou depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleContinueWithoutCpf}>
              Seguir sem
            </Button>
            <Button onClick={handleFinishNow} className="btn-primary">
              Terminar agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Onboarding;
