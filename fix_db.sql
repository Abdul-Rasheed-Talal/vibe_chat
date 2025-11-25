-- Run this in your Supabase SQL Editor to fix the missing table error

create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message text,
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_group boolean default false
);

create table if not exists conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (conversation_id, user_id)
);

-- Add conversation_id to messages if not exists
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'messages' and column_name = 'conversation_id') then
    alter table messages add column conversation_id uuid references conversations(id) on delete cascade;
  end if;
end $$;

-- Enable RLS
alter table conversations enable row level security;
alter table conversation_participants enable row level security;

-- Policies (safe to run multiple times as they will fail if exist, or we can drop first)
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
  with check (true);
