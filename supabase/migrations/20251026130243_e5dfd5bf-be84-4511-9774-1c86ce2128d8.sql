-- Add payment fields to invites table
ALTER TABLE public.invites 
ADD COLUMN payment_type text NOT NULL DEFAULT 'gratuito' CHECK (payment_type IN ('gratuito', 'pago')),
ADD COLUMN price numeric(10,2) CHECK (price IS NULL OR price >= 0);