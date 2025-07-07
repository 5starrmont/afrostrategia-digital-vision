-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('admin-uploads', 'admin-uploads', false);

-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content table
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL, -- 'insight', 'news', 'research', etc.
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  file_url TEXT,
  file_name TEXT,
  published BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Create policies for departments (public read, admin write)
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage departments" ON public.departments FOR ALL USING (auth.uid() IS NOT NULL);

-- Create policies for reports (public read, admin write)
CREATE POLICY "Anyone can view reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage reports" ON public.reports FOR ALL USING (auth.uid() IS NOT NULL);

-- Create policies for content (public read published content, admin write)
CREATE POLICY "Anyone can view published content" ON public.content FOR SELECT USING (published = true);
CREATE POLICY "Authenticated users can view all content" ON public.content FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage content" ON public.content FOR ALL USING (auth.uid() IS NOT NULL);

-- Create storage policies for admin uploads
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'admin-uploads' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view files" ON storage.objects FOR SELECT USING (bucket_id = 'admin-uploads' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update files" ON storage.objects FOR UPDATE USING (bucket_id = 'admin-uploads' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete files" ON storage.objects FOR DELETE USING (bucket_id = 'admin-uploads' AND auth.uid() IS NOT NULL);

-- Insert default departments
INSERT INTO public.departments (name, slug, description) VALUES
('Digital Trade', 'digital-trade', 'Advancing digital commerce and trade policies across Africa'),
('AI Governance', 'ai-governance', 'Developing frameworks for responsible AI implementation'),
('Cyber Diplomacy', 'cyber-diplomacy', 'Promoting cybersecurity and digital diplomacy initiatives'),
('Youth Strategy', 'youth-strategy', 'Empowering African youth through digital innovation'),
('Research', 'research', 'Conducting strategic research on digital transformation');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();