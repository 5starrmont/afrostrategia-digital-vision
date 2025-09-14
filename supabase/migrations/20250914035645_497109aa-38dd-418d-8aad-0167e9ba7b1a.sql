-- Fix partner logo URLs to use correct paths
UPDATE partners 
SET logo_url = REPLACE(logo_url, '/src/', '/') 
WHERE logo_url LIKE '/src/%';