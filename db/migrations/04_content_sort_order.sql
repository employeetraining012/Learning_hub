-- Add sort_order to content_items
ALTER TABLE public.content_items ADD COLUMN sort_order int NOT NULL DEFAULT 0;

-- Update existing items to have a default sequence based on created_at
WITH numbered_content AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY module_id ORDER BY created_at) - 1 as new_order
    FROM public.content_items
)
UPDATE public.content_items
SET sort_order = numbered_content.new_order
FROM numbered_content
WHERE public.content_items.id = numbered_content.id;

-- Add index
CREATE INDEX idx_content_module_sort ON public.content_items(module_id, sort_order);
