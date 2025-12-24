export type Profile = {
    id: string;
    full_name: string;
    email: string;
    role: 'admin' | 'employee';
    active: boolean;
    created_at: string;
    updated_at: string;
};

export type Course = {
    id: string;
    tenant_id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    status: 'draft' | 'published' | 'archived';
    published_at?: string | null;
    created_at: string;
    updated_at: string;
};

export type Module = {
    id: string;
    tenant_id: string;
    course_id: string;
    title: string;
    description: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

export type ContentItemType = 'youtube' | 'pdf' | 'ppt' | 'link' | 'video' | 'image';

export type ContentItem = {
    id: string;
    tenant_id: string;
    module_id: string;
    title: string;
    url: string;
    type: ContentItemType;
    sort_order: number;
    content_source: 'external' | 'storage';
    storage_path?: string | null;
    mime_type?: string | null;
    file_size?: number | null;
    created_at: string;
    updated_at: string;
};

export type Assignment = {
    id: string;
    employee_id: string;
    course_id: string;
    assigned_at: string;
};

export type ContentProgress = {
    id: string;
    tenant_id: string;
    employee_id: string;
    content_item_id: string;
    completed: boolean;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
};
