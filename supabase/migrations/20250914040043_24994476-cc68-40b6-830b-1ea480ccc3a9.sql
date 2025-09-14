-- Update partner logo URLs to use public folder paths
UPDATE partners 
SET logo_url = REPLACE(logo_url, '/assets/logos/', '/logos/') 
WHERE logo_url LIKE '/assets/logos/%';