-- Content Progress Tracking Table
-- Stores completion status for each content item per employee

CREATE TABLE IF NOT EXISTS public.content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, content_item_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_content_progress_employee ON public.content_progress(employee_id);
CREATE INDEX IF NOT EXISTS idx_content_progress_content ON public.content_progress(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_progress_tenant ON public.content_progress(tenant_id);

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_content_progress
BEFORE UPDATE ON public.content_progress
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.content_progress ENABLE ROW LEVEL SECURITY;

-- Employees can view and update their own progress
CREATE POLICY "employees_own_progress" ON public.content_progress
FOR ALL USING (auth.uid() = employee_id);

-- Admins can view all progress in their tenant
CREATE POLICY "admins_view_tenant_progress" ON public.content_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
    AND profiles.tenant_id = content_progress.tenant_id
  )
);
