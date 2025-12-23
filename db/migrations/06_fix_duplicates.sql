-- RUN THIS TO FIX EXISTING DUPLICATE ORDERS
-- This will re-assign a clean 1, 2, 3 sequence to all modules based on their current order

WITH reordered AS (
    SELECT 
        id, 
        ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY sort_order ASC, created_at ASC) as new_order
    FROM public.modules
)
UPDATE public.modules
SET sort_order = reordered.new_order
FROM reordered
WHERE public.modules.id = reordered.id;

-- Also for Content Items
WITH reordered_content AS (
    SELECT 
        id, 
        ROW_NUMBER() OVER (PARTITION BY module_id ORDER BY sort_order ASC, created_at ASC) as new_order
    FROM public.content_items
)
UPDATE public.content_items
SET sort_order = reordered_content.new_order
FROM reordered_content
WHERE public.content_items.id = reordered_content.id;
