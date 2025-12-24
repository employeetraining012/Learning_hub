-- Add image_url to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS image_url text;
