-- Insert demo content for visualization
INSERT INTO public.content (title, body, type, published, department_id, file_url, file_name) VALUES 
(
  'Digital Payment Systems in Sub-Saharan Africa: A Comprehensive Analysis',
  'This comprehensive report examines the rapid growth of digital payment systems across Sub-Saharan Africa, analyzing the impact of mobile money platforms, blockchain technology, and regulatory frameworks on financial inclusion. The study covers 15 countries and provides actionable insights for policymakers and financial institutions.',
  'report',
  true,
  (SELECT id FROM departments WHERE slug = 'digital-trade-fintech-access'),
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
  'digital-payments-africa-2024.pdf'
),
(
  'AI Governance Framework for African Digital Transformation',
  'A detailed policy brief outlining ethical AI governance principles tailored for African contexts. This framework addresses algorithmic bias, data sovereignty, and inclusive AI development practices that align with African values and development goals.',
  'policy',
  true,
  (SELECT id FROM departments WHERE slug = 'ai-ethics-governance-innovation'),
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
  'ai-governance-framework-africa.pdf'
),
(
  'Cyber Sovereignty and Digital Rights in the Global South',
  'This research paper explores the concept of cyber sovereignty from an African perspective, examining how nations can maintain digital autonomy while participating in the global digital economy. The study includes case studies from Ghana, Kenya, and South Africa.',
  'research',
  true,
  (SELECT id FROM departments WHERE slug = 'afro-sovereignty-cyber-diplomacy'),
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  'cyber-sovereignty-research-2024.pdf'
),
(
  'Youth Digital Skills Development: A Continental Strategy',
  'A strategic policy document outlining a comprehensive approach to developing digital skills among African youth. The strategy includes recommendations for education reform, public-private partnerships, and technology access initiatives.',
  'policy',
  true,
  (SELECT id FROM departments WHERE slug = 'youth-strategy-digital-rights'),
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
  'youth-digital-strategy-2024.pdf'
),
(
  'Blockchain Technology for Supply Chain Transparency in Africa',
  'An in-depth research study examining how blockchain technology can enhance supply chain transparency in African agricultural and mining sectors. The report includes pilot project results from Nigeria, Rwanda, and Botswana.',
  'research',
  true,
  (SELECT id FROM departments WHERE slug = 'digital-trade-fintech-access'),
  'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800',
  'blockchain-supply-chain-africa.pdf'
),
(
  'Ethical AI in Healthcare: Guidelines for African Implementation',
  'A comprehensive guide for implementing ethical AI systems in African healthcare contexts. This document addresses privacy concerns, algorithmic fairness, and the unique challenges of deploying AI in resource-constrained environments.',
  'report',
  true,
  (SELECT id FROM departments WHERE slug = 'ai-ethics-governance-innovation'),
  NULL,
  NULL
),
(
  'Digital Rights and Internet Freedom in Africa: 2024 Assessment',
  'An annual assessment of digital rights and internet freedom across African nations. The report analyzes government policies, digital surveillance practices, and civil society responses to protect online freedoms.',
  'research',
  true,
  (SELECT id FROM departments WHERE slug = 'youth-strategy-digital-rights'),
  'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800',
  'digital-rights-assessment-2024.pdf'
),
(
  'Cross-Border Digital Trade Facilitation: Policy Recommendations',
  'Policy recommendations for facilitating cross-border digital trade within the African Continental Free Trade Area (AfCFTA). The document addresses regulatory harmonization, digital payment systems, and e-commerce infrastructure development.',
  'policy',
  true,
  (SELECT id FROM departments WHERE slug = 'afro-sovereignty-cyber-diplomacy'),
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  'cross-border-digital-trade-policy.pdf'
);