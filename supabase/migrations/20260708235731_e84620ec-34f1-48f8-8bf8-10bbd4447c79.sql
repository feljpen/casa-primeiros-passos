-- Leads table for Minha Casa Minha Vida capture landing page
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  cidade TEXT NOT NULL,
  documentos JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone (a prospective lead, not logged in) can submit their info
CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated staff can read leads (admin/backoffice)
CREATE POLICY "Authenticated can read leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (true);

-- Storage policies: allow public (anon) to upload document photos, but not read them back
CREATE POLICY "Anyone can upload lead documents"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Authenticated can read lead documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documentos');