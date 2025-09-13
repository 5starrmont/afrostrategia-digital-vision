-- Create partners table for managing strategic partnerships
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policies for partner access
CREATE POLICY "Anyone can view active partners" 
ON public.partners 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admins and moderators can manage partners" 
ON public.partners 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for partner logos
INSERT INTO storage.buckets (id, name, public) VALUES ('partner-logos', 'partner-logos', true);

-- Create storage policies for partner logos
CREATE POLICY "Partner logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'partner-logos');

CREATE POLICY "Admins and moderators can upload partner logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'partner-logos' AND 
  auth.uid() IS NOT NULL AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
);

CREATE POLICY "Admins and moderators can update partner logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'partner-logos' AND 
  auth.uid() IS NOT NULL AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
);

CREATE POLICY "Admins and moderators can delete partner logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'partner-logos' AND 
  auth.uid() IS NOT NULL AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
);

-- Insert existing partners data
INSERT INTO public.partners (name, type, description, display_order, logo_url) VALUES
('Microsoft', 'Technology Partner', 'Strategic technology partnership for digital transformation initiatives across Africa.', 1, '/src/assets/logos/microsoft.png'),
('World Economic Forum', 'Strategic Alliance', 'Collaboration on global economic policy and strategic foresight for African development.', 2, '/src/assets/logos/wef.png'),
('Brookings Institution', 'Research Partner', 'Joint research initiatives on African policy, governance, and economic development.', 3, '/src/assets/logos/brookings.png'),
('Mozilla Foundation', 'Innovation Partner', 'Partnership in digital rights, internet governance, and technology policy advocacy.', 4, '/src/assets/logos/mozilla.png'),
('African Union', 'Institutional Partner', 'Official partnership supporting continental integration and strategic policy development.', 5, '/src/assets/logos/african-union.png'),
('UN Economic Commission for Africa', 'UN Partner', 'Collaboration on economic research, policy analysis, and sustainable development goals.', 6, '/src/assets/logos/uneca.png'),
('Digital Africa', 'Innovation Hub', 'Partnership in digital innovation, entrepreneurship, and technology ecosystem development.', 7, '/src/assets/logos/digital-africa.png'),
('GSMA', 'Mobile Industry Partner', 'Strategic partnership in mobile technology, digital financial services, and connectivity.', 8, '/src/assets/logos/gsma.png'),
('International Telecommunication Union', 'Technical Partner', 'Collaboration on telecommunications policy, digital infrastructure, and connectivity standards.', 9, '/src/assets/logos/itu.png'),
('Cooperative University of Kenya', 'Academic Partner', 'Educational partnership in research, capacity building, and knowledge exchange programs.', 10, '/src/assets/logos/cuk.png');