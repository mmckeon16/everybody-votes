-- Create a dedicated table for push tokens
create table push_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  token text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  -- Add a unique constraint to prevent duplicate tokens per user
  constraint unique_user_token unique (user_id, token)
);

-- Add an index for faster lookups
create index idx_push_tokens_user_id on push_tokens(user_id);

-- Create the moddatetime function if it doesn't exist
create or replace function moddatetime()
returns trigger as $$
begin
    new.updated_at = current_timestamp;
    return new;
end;
$$ language plpgsql;

-- Add a trigger to update the updated_at timestamp
create trigger set_push_tokens_timestamp
  before update on push_tokens
  for each row
  execute procedure moddatetime (updated_at);