-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert messages
CREATE POLICY "Allow anonymous users to insert contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

-- Only authenticated users (e.g. admins) can read messages
CREATE POLICY "Allow authenticated users to read contact messages" ON public.contact_messages
    FOR SELECT USING (auth.role() = 'authenticated');
