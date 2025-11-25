-- COMBINED MIGRATION: Conversations + Unread Counts
-- Run this in your Supabase SQL Editor

-- 1. Create conversations table
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message text,
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_group boolean default false
);

-- 2. Create participants table
create table if not exists conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (conversation_id, user_id)
);

-- 3. Add conversation_id to messages if not exists
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'messages' and column_name = 'conversation_id') then
        alter table messages add column conversation_id uuid references conversations(id) on delete cascade;
    end if;
end $$;

-- 4. Make receiver_id nullable (for group/conversation support)
alter table messages alter column receiver_id drop not null;

-- 5. Indexes
create index if not exists idx_participants_user on conversation_participants(user_id);
create index if not exists idx_participants_conversation on conversation_participants(conversation_id);
create index if not exists idx_messages_conversation on messages(conversation_id);

-- 6. RLS for Conversations
alter table conversations enable row level security;

drop policy if exists "Users can view conversations they are part of" on conversations;
create policy "Users can view conversations they are part of"
  on conversations for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_participants.conversation_id = conversations.id
      and conversation_participants.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert conversations" on conversations;
create policy "Users can insert conversations"
  on conversations for insert
  with check (true);

-- 7. RLS for Participants
alter table conversation_participants enable row level security;

drop policy if exists "Users can view participants of their conversations" on conversation_participants;
create policy "Users can view participants of their conversations"
  on conversation_participants for select
  using (
    exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
    )
  );

drop policy if exists "Users can join/create conversations" on conversation_participants;
create policy "Users can join/create conversations"
  on conversation_participants for insert
  with check (
    user_id = auth.uid() 
    or 
    exists (
       select 1 from conversation_participants cp
       where cp.conversation_id = conversation_participants.conversation_id
       and cp.user_id = auth.uid()
    )
    or
    true 
  );

-- 8. Update Messages RLS
drop policy if exists "Users can read messages sent to them or by them." on messages;
drop policy if exists "Users can read messages in their conversations" on messages;
create policy "Users can read messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_participants.conversation_id = messages.conversation_id
      and conversation_participants.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert messages sent by them." on messages;
drop policy if exists "Users can insert messages in their conversations" on messages;
create policy "Users can insert messages in their conversations"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and
    exists (
      select 1 from conversation_participants
      where conversation_participants.conversation_id = conversation_id
      and conversation_participants.user_id = auth.uid()
    )
  );

-- 9. Unread Count Trigger
create or replace function update_last_read()
returns trigger as $$
begin
  update conversation_participants
  set last_read_at = new.created_at
  where conversation_id = new.conversation_id
  and user_id = new.sender_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_message_sent on messages;
create trigger on_message_sent
  after insert on messages
  for each row
  execute procedure update_last_read();
