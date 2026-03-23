import React from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MOCK_HOBBIES } from '@/lib/mock-data';
import { useState } from 'react';

const CreateOut: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', hobby_id: null as number | null, city: '', slots: 3, mode: 'presencial',
    payment_type: 'gratuito' as 'gratuito' | 'pago', price: null as number | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.title.length < 5) { toast.error('Título deve ter pelo menos 5 caracteres'); return; }
    toast.success('Out criado com sucesso! (modo demo)');
    navigate('/my-outs');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Criar Out</h1>
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div><Label htmlFor="title">Título *</Label><Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
              <div><Label>Descrição</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
              <div><Label>Hobby</Label>
                <Select value={formData.hobby_id?.toString() || ''} onValueChange={(v) => setFormData({ ...formData, hobby_id: parseInt(v) })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{MOCK_HOBBIES.map(h => <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Cidade</Label><Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} /></div>
              <div className="flex gap-2">
                <Button type="button" variant={formData.payment_type === 'gratuito' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, payment_type: 'gratuito', price: null })}>Gratuito</Button>
                <Button type="button" variant={formData.payment_type === 'pago' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, payment_type: 'pago' })}>Pago</Button>
              </div>
              {formData.payment_type === 'pago' && <div><Label>Valor (R$)</Label><Input type="number" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || null })} /></div>}
              <Button type="submit" className="w-full bg-[#B6463A] hover:bg-[#A23F35]">Criar Out</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateOut;
