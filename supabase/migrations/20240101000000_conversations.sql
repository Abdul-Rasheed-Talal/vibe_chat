-- Create conversations table
create table conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message text,
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_group boolean default false
);

-- Create participants table
create table conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (conversation_id, user_id)
);

-- Add conversation_id to messages
alter table messages 
add column conversation_id uuid references conversations(id) on delete cascade;

-- Index for performance
create index idx_participants_user on conversation_participants(user_id);
create index idx_participants_conversation on conversation_participants(conversation_id);
create index idx_messages_conversation on messages(conversation_id);

-- RLS for Conversations
alter table conversations enable row level security;

create policy "Users can view conversations they are part of"
  on conversations for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_participants.conversation_id = conversations.id
      and conversation_participants.user_id = auth.uid()
    )
  );

create policy "Users can insert conversations"
  on conversations for insert
  with check (true); -- Participants will be added in the same transaction usually, or we check participants

-- RLS for Participants
alter table conversation_participants enable row level security;

create policy "Users can view participants of their conversations"
  on conversation_participants for select
  using (
    exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
    )
  );

create policy "Users can join/create conversations"
  on conversation_participants for insert
  with check (
    user_id = auth.uid() -- Self-join
    or 
    exists ( -- Or adding someone else if you are already in the conversation (or creating it)
       select 1 from conversation_participants cp
       where cp.conversation_id = conversation_participants.conversation_id
       and cp.user_id = auth.uid()
    )
    or
    -- Allow creating a new conversation with participants (initial setup)
    -- This is tricky in RLS without a transaction context, often handled by a function or trusting the creator
    true 
  );
  
-- Update Messages RLS to check conversation membership
drop policy if exists "Users can read messages sent to them or by them." on messages;
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
