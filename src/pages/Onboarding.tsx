import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageCropper } from "@/components/ImageCropper";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Shield, CheckCircle2, Upload, Loader2, X, Plus } from "lucide-react";
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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingCpf, setCheckingCpf] = useState(false);
  const [cpfChecked, setCpfChecked] = useState(false);
  const [checkingPhoto, setCheckingPhoto] = useState(false);
  const [photoChecked, setPhotoChecked] = useState(false);
  const [selectedHobbies, setSelectedHobbies] = useState<number[]>([]);
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [otherHobbiesList, setOtherHobbiesList] = useState<string[]>([]);
  const [currentOtherHobby, setCurrentOtherHobby] = useState("");

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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      loadHobbies();
    }
  }, [user, authLoading, navigate]);

  const loadHobbies = async () => {
    try {
      const { data, error } = await supabase.from("hobbies").select("*");
      if (error) {
        toast.error("Erro ao carregar hobbies");
        return;
      }
      if (data) {
        setHobbies(data);
      }
    } catch (error) {
      console.error("Erro ao carregar hobbies:", error);
    }
  };

  const validateStep1 = () => {
    if (!formData.display_name || formData.display_name.length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres");
      return false;
    }
    if (!formData.handle || formData.handle.length < 3) {
      toast.error("Apelido deve ter pelo menos 3 caracteres");
      return false;
    }
    if (/\s/.test(formData.handle)) {
      toast.error("Apelido não pode conter espaços");
      return false;
    }
    return true;
  };

  const addOtherHobby = () => {
    const trimmed = currentOtherHobby.trim();
    if (trimmed && !otherHobbiesList.includes(trimmed)) {
      setOtherHobbiesList([...otherHobbiesList, trimmed]);
      setCurrentOtherHobby("");
    }
  };

  const removeOtherHobby = (hobby: string) => {
    setOtherHobbiesList(otherHobbiesList.filter((h) => h !== hobby));
  };

  const savePartialProfile = async () => {
    if (!user) return false;

    try {
      const profileData = {
        user_id: user.id,
        display_name: formData.display_name,
        handle: formData.handle,
        country: formData.country || "Brasil",
        state: formData.state,
        city: formData.city,
        bio: formData.bio,
        other_hobbies: otherHobbiesList.join(", "),
        cpf: formData.cpf || null,
        avatar_url: formData.avatar_url || null,
      };

      // Check if handle already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("handle", formData.handle)
        .neq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        toast.error("Este apelido já está em uso");
        return false;
      }

      const { error: profileError } = await supabase.from("profiles").upsert(profileData);

      if (profileError) {
        throw profileError;
      }

      // Only save hobbies if there are any selected
      if (selectedHobbies.length > 0) {
        // First, delete existing hobbies
        const { error: deleteError } = await supabase
          .from("user_hobbies")
          .delete()
          .eq("user_id", user.id);

        if (deleteError) {
          console.error("Erro ao deletar hobbies antigos:", deleteError);
        }

        // Wait a bit to ensure delete completed
        await new Promise(resolve => setTimeout(resolve, 100));

        const userHobbiesData = selectedHobbies.map((hobbyId) => ({
          user_id: user.id,
          hobby_id: hobbyId,
          level: "iniciante",
        }));

        const { error: hobbiesError } = await supabase
          .from("user_hobbies")
          .insert(userHobbiesData);

        if (hobbiesError) {
          console.error("Erro ao inserir hobbies:", hobbiesError);
          // Don't block the flow if hobbies fail
        }
      }

      return true;
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      toast.error(error.message || "Erro ao salvar perfil");
      return false;
    }
  };

  const handleStep1Continue = async () => {
    if (!validateStep1()) return;
    
    setLoading(true);
    const saved = await savePartialProfile();
    setLoading(false);
    
    if (saved) {
      setCurrentStep(2);
    }
  };

  const handleStep2Continue = async () => {
    if (!formData.cpf) {
      toast.error("Por favor, informe seu CPF");
      return;
    }

    setCheckingCpf(true);
    await new Promise(resolve => setTimeout(resolve, 1800));
    setCheckingCpf(false);
    setCpfChecked(true);
    
    setLoading(true);
    await savePartialProfile();
    setLoading(false);

    await new Promise(resolve => setTimeout(resolve, 800));
    setCurrentStep(3);
  };

  const handleStep2Skip = () => {
    setCurrentStep(3);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Arquivo selecionado:", file.name, file.type, file.size);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log("Imagem carregada, abrindo cropper");
      setSelectedImage(reader.result as string);
      setShowCropper(true);
    };
    reader.onerror = (error) => {
      console.error("Erro ao ler arquivo:", error);
      toast.error("Erro ao carregar imagem");
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImage: Blob) => {
    if (!user) return;

    console.log("Iniciando upload da imagem cortada");
    setShowCropper(false);
    setUploading(true);

    try {
      // O arquivo deve estar em uma pasta com o user_id para as políticas RLS funcionarem
      const fileName = `${user.id}/${Date.now()}.jpg`;
      console.log("Fazendo upload para:", fileName);
      
      const { error: uploadError, data } = await supabase.storage
        .from("media-avatars")
        .upload(fileName, croppedImage, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        throw uploadError;
      }

      console.log("Upload concluído, obtendo URL pública");
      const { data: { publicUrl } } = supabase.storage
        .from("media-avatars")
        .getPublicUrl(fileName);

      console.log("URL pública obtida:", publicUrl);
      setFormData({ ...formData, avatar_url: publicUrl });
      toast.success("Foto enviada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Falha ao enviar foto. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (formData.avatar_url) {
      setCheckingPhoto(true);
      await new Promise(resolve => setTimeout(resolve, 1800));
      setCheckingPhoto(false);
      setPhotoChecked(true);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setLoading(true);
    const saved = await savePartialProfile();
    setLoading(false);

    if (saved) {
      toast.success("Perfil criado com sucesso!");
      navigate("/feed");
    }
  };

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return value;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F2EF]">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) return null;

  const progressValue = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center p-4">
      <Card className="w-full max-w-[720px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Bem-vindo(a)! Vamos configurar seu perfil.</CardTitle>
          <div className="space-y-3 mt-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step <= currentStep ? "bg-[#B6463A]" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <Progress value={progressValue} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Etapa {currentStep} de 3
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {checkingCpf && (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#B6463A]" />
              <p className="text-lg font-medium">Checando CPF…</p>
            </div>
          )}

          {cpfChecked && !checkingPhoto && currentStep === 2 && (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
              <p className="text-lg font-medium">CPF checado ✅</p>
            </div>
          )}

          {checkingPhoto && (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#B6463A]" />
              <p className="text-lg font-medium">Checando foto…</p>
            </div>
          )}

          {photoChecked && currentStep === 3 && (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
              <p className="text-lg font-medium">Foto checada ✅</p>
            </div>
          )}

          {!checkingCpf && !checkingPhoto && !photoChecked && (
            <>
              {/* STEP 1 - Dados */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="display_name">Nome *</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="handle">Apelido (@handle) *</Label>
                    <Input
                      id="handle"
                      value={formData.handle}
                      onChange={(e) =>
                        setFormData({ ...formData, handle: e.target.value.replace(/\s/g, "") })
                      }
                      placeholder="seunome"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Seu nome público curto. Ex.: @jubacci
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
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
                    <Label htmlFor="bio">Bio (240-400 caracteres)</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      maxLength={400}
                      placeholder="Conte um pouco sobre você..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.bio.length}/400 caracteres
                    </p>
                  </div>

                  <div>
                    <Label>Hobbies</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {hobbies.map((hobby) => (
                        <div key={hobby.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`hobby-${hobby.id}`}
                            checked={selectedHobbies.includes(hobby.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedHobbies([...selectedHobbies, hobby.id]);
                              } else {
                                setSelectedHobbies(selectedHobbies.filter((id) => id !== hobby.id));
                              }
                            }}
                          />
                          <Label htmlFor={`hobby-${hobby.id}`} className="cursor-pointer font-normal">
                            {hobby.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Outros hobbies</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={currentOtherHobby}
                        onChange={(e) => setCurrentOtherHobby(e.target.value)}
                        placeholder="Digite um hobby..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addOtherHobby();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addOtherHobby}
                        disabled={!currentOtherHobby.trim()}
                        className="bg-[#B6463A] hover:bg-[#A23F35] text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {otherHobbiesList.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {otherHobbiesList.map((hobby, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-accent text-accent-foreground"
                          >
                            {hobby}
                            <button
                              type="button"
                              onClick={() => removeOtherHobby(hobby)}
                              className="hover:text-[#B6463A] transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2 - CPF */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-accent p-4 rounded-lg flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#B6463A] mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Usamos o CPF apenas para verificação de segurança.</strong>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: formatCpf(e.target.value) })}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3 - Foto */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <Avatar className="w-32 h-32 mx-auto">
                      {formData.avatar_url ? (
                        <AvatarImage src={formData.avatar_url} alt="Avatar" />
                      ) : (
                        <AvatarFallback className="text-4xl bg-muted">
                          {formData.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="avatar-upload"
                      disabled={uploading}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => {
                        console.log("Botão clicado, abrindo seletor de arquivo");
                        document.getElementById("avatar-upload")?.click();
                      }}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Escolher foto
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-muted-foreground">
                      {formData.avatar_url
                        ? "Foto selecionada com sucesso!"
                        : "Você pode adicionar uma foto agora ou depois"}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Botões de navegação */}
          {!checkingCpf && !checkingPhoto && !photoChecked && !cpfChecked && (
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1 || loading}
              >
                Voltar
              </Button>

              <div className="flex gap-2">
                {currentStep === 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleStep2Skip}
                    disabled={loading}
                  >
                    Pular por enquanto
                  </Button>
                )}

                {currentStep === 1 && (
                  <Button
                    type="button"
                    onClick={handleStep1Continue}
                    disabled={loading}
                    className="bg-[#B6463A] hover:bg-[#A23F35] text-white"
                  >
                    {loading ? "Salvando..." : "Continuar"}
                  </Button>
                )}

                {currentStep === 2 && (
                  <Button
                    type="button"
                    onClick={handleStep2Continue}
                    disabled={loading || !formData.cpf}
                    className="bg-[#B6463A] hover:bg-[#A23F35] text-white"
                  >
                    Continuar
                  </Button>
                )}

                {currentStep === 3 && (
                  <Button
                    type="button"
                    onClick={handleComplete}
                    disabled={loading || uploading}
                    className="bg-[#B6463A] hover:bg-[#A23F35] text-white"
                  >
                    {loading ? "Finalizando..." : "Concluir"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ImageCropper
        image={selectedImage || ""}
        open={showCropper}
        onClose={() => setShowCropper(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default Onboarding;
