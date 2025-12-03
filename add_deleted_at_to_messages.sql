-- Add deleted_at column to messages table
alter table messages add column if not exists deleted_at timestamp with time zone;

-- Update RLS policy to allow users to update their own messages (for soft delete)
drop policy if exists "Users can update their own messages" on messages;
create policy "Users can update their own messages"
  on messages for update
  using ( auth.uid() = sender_id )
  with check ( auth.uid() = sender_id );
