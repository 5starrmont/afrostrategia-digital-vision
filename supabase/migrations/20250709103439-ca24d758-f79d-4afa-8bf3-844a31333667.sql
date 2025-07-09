-- Add media support and blog functionality to content table
ALTER TABLE public.content 
ADD COLUMN media_type TEXT DEFAULT 'document' CHECK (media_type IN ('document', 'video', 'image', 'audio', 'blog')),
ADD COLUMN media_url TEXT,
ADD COLUMN thumbnail_url TEXT,
ADD COLUMN slug TEXT,
ADD COLUMN author TEXT DEFAULT 'AfroStrategia',
ADD COLUMN read_time INTEGER; -- estimated read time in minutes

-- Create unique slug constraint
CREATE UNIQUE INDEX idx_content_slug ON public.content(slug) WHERE slug IS NOT NULL;

-- Add some sample media content
INSERT INTO public.content (title, body, type, published, department_id, media_type, media_url, thumbnail_url, slug, author, read_time) VALUES 
(
  'The Future of Digital Banking in Africa',
  'Africa is witnessing a digital banking revolution that is transforming how people access financial services. Mobile banking platforms like M-Pesa in Kenya and similar services across the continent are providing millions of people with their first access to formal financial services. This blog explores the trends, challenges, and opportunities in African digital banking, examining successful case studies and providing insights into what the future holds for financial inclusion across the continent.',
  'blog',
  true,
  (SELECT id FROM departments WHERE slug = 'digital-trade-fintech-access'),
  'blog',
  NULL,
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400',
  'future-digital-banking-africa',
  'Dr. Amina Kone',
  8
),
(
  'AI Ethics Roundtable Discussion',
  'Join our panel of experts as they discuss the critical importance of ethical AI development in African contexts. This video features leading researchers, policymakers, and tech entrepreneurs sharing insights on building AI systems that serve African communities responsibly.',
  'video',
  true,
  (SELECT id FROM departments WHERE slug = 'ai-ethics-governance-innovation'),
  'video',
  'https://player.vimeo.com/video/123456789',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
  'ai-ethics-roundtable-2024',
  'AfroStrategia Panel',
  45
),
(
  'Cybersecurity Landscape Infographic',
  'A comprehensive visual guide to the current cybersecurity challenges and solutions across African nations. This infographic presents key statistics, emerging threats, and recommended best practices for individuals and organizations.',
  'infographic',
  true,
  (SELECT id FROM departments WHERE slug = 'afro-sovereignty-cyber-diplomacy'),
  'image',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  'cybersecurity-landscape-infographic',
  'Design Team',
  5
),
(
  'Youth Voices: Digital Rights in Practice',
  'Young African activists share their experiences advocating for digital rights in their communities. This blog post features interviews with digital rights advocates from across the continent, highlighting grassroots initiatives and policy recommendations.',
  'blog',
  true,
  (SELECT id FROM departments WHERE slug = 'youth-strategy-digital-rights'),
  'blog',
  NULL,
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
  'youth-voices-digital-rights',
  'Sarah Mbeki',
  12
),
(
  'Blockchain Innovation Summit Highlights',
  'Watch key moments from our recent Blockchain Innovation Summit, featuring demonstrations of cutting-edge applications in supply chain management, digital identity, and cross-border payments.',
  'video',
  true,
  (SELECT id FROM departments WHERE slug = 'digital-trade-fintech-access'),
  'video',
  'https://player.vimeo.com/video/987654321',
  'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400',
  'blockchain-summit-highlights',
  'Event Team',
  25
);