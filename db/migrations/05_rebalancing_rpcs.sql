-- 1. MODULES REBALANCING

-- Add/Insert: Shift existing items >= threshold down
CREATE OR REPLACE FUNCTION public.increment_module_orders(
    p_course_id uuid,
    p_tenant_id uuid,
    p_threshold int
) RETURNS void AS $$
BEGIN
    UPDATE public.modules
    SET sort_order = sort_order + 1
    WHERE course_id = p_course_id
      AND tenant_id = p_tenant_id
      AND sort_order >= p_threshold;
END;
$$ LANGUAGE plpgsql;

-- Move Up (Smaller number): Shift items in between down
CREATE OR REPLACE FUNCTION public.reorder_modules_up(
    p_course_id uuid,
    p_tenant_id uuid,
    p_new_order int,
    p_old_order int
) RETURNS void AS $$
BEGIN
    UPDATE public.modules
    SET sort_order = sort_order + 1
    WHERE course_id = p_course_id
      AND tenant_id = p_tenant_id
      AND sort_order >= p_new_order
      AND sort_order < p_old_order;
END;
$$ LANGUAGE plpgsql;

-- Move Down (Larger number): Shift items in between up
CREATE OR REPLACE FUNCTION public.reorder_modules_down(
    p_course_id uuid,
    p_tenant_id uuid,
    p_new_order int,
    p_old_order int
) RETURNS void AS $$
BEGIN
    UPDATE public.modules
    SET sort_order = sort_order - 1
    WHERE course_id = p_course_id
      AND tenant_id = p_tenant_id
      AND sort_order > p_old_order
      AND sort_order <= p_new_order;
END;
$$ LANGUAGE plpgsql;

-- 2. CONTENT ITEMS REBALANCING

CREATE OR REPLACE FUNCTION public.increment_content_orders(
    p_module_id uuid,
    p_tenant_id uuid,
    p_threshold int
) RETURNS void AS $$
BEGIN
    UPDATE public.content_items
    SET sort_order = sort_order + 1
    WHERE module_id = p_module_id
      AND tenant_id = p_tenant_id
      AND sort_order >= p_threshold;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.reorder_content_up(
    p_module_id uuid,
    p_tenant_id uuid,
    p_new_order int,
    p_old_order int
) RETURNS void AS $$
BEGIN
    UPDATE public.content_items
    SET sort_order = sort_order + 1
    WHERE module_id = p_module_id
      AND tenant_id = p_tenant_id
      AND sort_order >= p_new_order
      AND sort_order < p_old_order;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.reorder_content_down(
    p_module_id uuid,
    p_tenant_id uuid,
    p_new_order int,
    p_old_order int
) RETURNS void AS $$
BEGIN
    UPDATE public.content_items
    SET sort_order = sort_order - 1
    WHERE module_id = p_module_id
      AND tenant_id = p_tenant_id
      AND sort_order > p_old_order
      AND sort_order <= p_new_order;
END;
$$ LANGUAGE plpgsql;
