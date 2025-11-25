-- Make receiver_id nullable since we use conversation_id now (and groups don't have a single receiver)
alter table messages alter column receiver_id drop not null;

-- Add last_read_at to conversation_participants for unread counts
alter table conversation_participants 
add column last_read_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Function to update last_read_at
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

-- Trigger to auto-mark sender as having read their own message
create trigger on_message_sent
  after insert on messages
  for each row
  execute procedure update_last_read();
