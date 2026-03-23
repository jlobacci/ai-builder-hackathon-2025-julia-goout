import React from 'react';
import { Layout } from '@/components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getInviteWithRelations } from '@/lib/mock-data';

const EditOut: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const out = getInviteWithRelations(Number(id));

  if (!out) {
    return <Layout><p className="text-center text-muted-foreground">Out não encontrado</p></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/out/${id}`)}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-3xl font-bold">Editar Out</h1>
        </div>
        <p className="text-muted-foreground text-center py-12">
          Edição disponível apenas no modo completo. No modo de apresentação, as alterações não são persistidas.
        </p>
        <div className="flex justify-center">
          <Button onClick={() => { toast.success('Out atualizado! (modo demo)'); navigate(`/out/${id}`); }}>Simular salvamento</Button>
        </div>
      </div>
    </Layout>
  );
};

export default EditOut;
