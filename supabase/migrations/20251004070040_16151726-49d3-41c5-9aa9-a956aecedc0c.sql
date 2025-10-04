-- Delete all existing departments
DELETE FROM public.departments;

-- Insert the 5 correct departments
INSERT INTO public.departments (name, slug, description) VALUES
  ('Digital Trade and Fintech Access', 'digital-trade-fintech', 'Focus on digital trade and financial technology access'),
  ('AI Ethics, Governance and Innovation', 'ai-governance', 'Artificial Intelligence ethics, governance and innovation'),
  ('Afro-Sovereignty and Cyber Diplomacy', 'cyber-diplomacy', 'Cyber diplomacy and digital sovereignty'),
  ('Youth Strategy and Digital Rights', 'youth-strategy', 'Youth engagement and digital rights'),
  ('Environmental Technology and Climate Innovation', 'environmental-technology', 'Environmental technology and climate innovation');