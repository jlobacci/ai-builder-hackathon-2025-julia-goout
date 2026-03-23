import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Layout } from '@/components/Layout';

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    // In mock mode, profile already exists - redirect to feed
    toast.success('Perfil já configurado!');
    navigate('/feed');
  }, [user, navigate]);

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </Layout>
  );
};

export default Onboarding;
