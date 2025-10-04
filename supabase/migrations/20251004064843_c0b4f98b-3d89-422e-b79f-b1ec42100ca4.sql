-- Update department names to match the correct naming
UPDATE public.departments SET 
  name = 'Digital Trade and Fintech Access',
  slug = 'digital-trade-fintech'
WHERE slug = 'digital-trade';

UPDATE public.departments SET 
  name = 'AI Ethics, Governance and Innovation',
  slug = 'ai-governance'
WHERE slug = 'ai-governance';

UPDATE public.departments SET 
  name = 'Afro-Sovereignty and Cyber Diplomacy',
  slug = 'cyber-diplomacy'
WHERE slug = 'cyber-diplomacy';

UPDATE public.departments SET 
  name = 'Youth Strategy and Digital Rights',
  slug = 'youth-strategy'
WHERE slug = 'youth-strategy';

UPDATE public.departments SET 
  name = 'Environmental Technology and Climate Innovation',
  slug = 'environmental-technology'
WHERE slug = 'environmental-technology';

-- Insert any missing departments
INSERT INTO public.departments (name, slug, description)
SELECT 'Digital Trade and Fintech Access', 'digital-trade-fintech', 'Focus on digital trade and financial technology access'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE slug = 'digital-trade-fintech');

INSERT INTO public.departments (name, slug, description)
SELECT 'AI Ethics, Governance and Innovation', 'ai-governance', 'Artificial Intelligence ethics, governance and innovation'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE slug = 'ai-governance');

INSERT INTO public.departments (name, slug, description)
SELECT 'Afro-Sovereignty and Cyber Diplomacy', 'cyber-diplomacy', 'Cyber diplomacy and digital sovereignty'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE slug = 'cyber-diplomacy');

INSERT INTO public.departments (name, slug, description)
SELECT 'Youth Strategy and Digital Rights', 'youth-strategy', 'Youth engagement and digital rights'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE slug = 'youth-strategy');

INSERT INTO public.departments (name, slug, description)
SELECT 'Environmental Technology and Climate Innovation', 'environmental-technology', 'Environmental technology and climate change innovation'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE slug = 'environmental-technology');