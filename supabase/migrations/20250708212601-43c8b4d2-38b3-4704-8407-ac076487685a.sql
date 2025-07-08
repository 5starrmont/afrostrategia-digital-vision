-- Insert the correct departments for AfroStrategia Foundation
INSERT INTO public.departments (name, slug, description) VALUES 
('Digital Trade & FinTech', 'digital-trade', 'Research and policy development on digital commerce, financial technology, and cross-border digital trade in Africa'),
('AI Governance & Ethics', 'ai-governance', 'Artificial intelligence governance frameworks, ethical AI development, and AI policy for African contexts'),
('Cyber Diplomacy', 'cyber-diplomacy', 'International cyber diplomacy, digital sovereignty, and cyber security policy for African nations'),
('Youth Digital Strategy', 'youth-strategy', 'Digital rights, digital literacy, and technology empowerment strategies for African youth')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;