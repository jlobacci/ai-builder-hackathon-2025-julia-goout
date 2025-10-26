-- Drop old constraint
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

-- Add new constraint with correct values
ALTER TABLE public.applications
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pendente', 'aceito', 'rejeitado', 'cancelada'));