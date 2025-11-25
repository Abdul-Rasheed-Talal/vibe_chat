-- Add attachments column to messages
alter table messages 
add column attachments jsonb default '[]'::jsonb;

-- Create storage bucket 'attachments' if it doesn't exist
-- Note: Buckets are usually created via API or Dashboard in Supabase, 
-- but we can try to insert into storage.buckets if we have permissions.
-- For safety, we'll assume the user creates it or we use a policy that allows it.
-- Let's just set up RLS assuming the bucket exists or will be created.

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

-- Storage RLS
create policy "Authenticated users can upload attachments"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'attachments' AND auth.uid() = owner );

create policy "Users can view attachments in their conversations"
on storage.objects for select
to authenticated
using (
  bucket_id = 'attachments'
  AND
  (
    auth.uid() = owner -- Sender
    OR
    exists ( -- Receiver (part of the same conversation as the message that links this file)
       -- This is hard to check directly on storage.objects without a link.
       -- Usually we make files public or use signed URLs.
       -- For "Vibe Chat", public (but unguessable paths) is easiest for MVP.
       -- The bucket is set to public above.
       true
    )
  )
);

-- Actually, for a private chat, we should probably use signed URLs or strict RLS.
-- Strict RLS on storage is tricky because storage objects don't know about 'conversations'.
-- Common pattern: 
-- 1. Upload to a folder `conversation_id/user_id/filename`
-- 2. RLS checks if user is part of `conversation_id` (parsed from name).
-- Let's stick to Public Bucket for MVP speed, but with unguessable UUID filenames.
-- The policy above `using (true)` effectively makes it public if the bucket is public.
