-- Insert the correct departments for AfroStrategia Foundation
INSERT INTO public.departments (name, slug, description) VALUES 
('Department of Digital Trade and FinTech Access', 'digital-trade', 'Research and policy development on digital commerce, financial technology, and cross-border digital trade in Africa'),
('Department of AI Ethics, Governance & Innovation', 'ai-governance', 'Artificial intelligence governance frameworks, ethical AI development, and AI policy for African contexts'),
('Department of Afro-Sovereignty and Cyber Diplomacy', 'cyber-diplomacy', 'International cyber diplomacy, digital sovereignty, and cyber security policy for African nations'),
('Department of Youth Strategy and Digital Rights', 'youth-strategy', 'Digital rights, digital literacy, and technology empowerment strategies for African youth')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;