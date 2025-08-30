-- Add sample departments if they don't exist
INSERT INTO public.departments (name, slug, description) VALUES
  ('Digital Policy', 'digital-policy', 'Research and analysis on digital governance and policy frameworks'),
  ('AI Governance', 'ai-governance', 'Artificial intelligence ethics and governance research'),
  ('Cyber Diplomacy', 'cyber-diplomacy', 'International cybersecurity and digital diplomacy'),
  ('Digital Trade', 'digital-trade', 'E-commerce and digital trade policy research'),
  ('Youth Strategy', 'youth-strategy', 'Youth engagement in digital transformation'),
  ('Environmental Tech', 'environmental-tech', 'Technology for environmental sustainability')
ON CONFLICT (slug) DO NOTHING;