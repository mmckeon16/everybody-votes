-- Create demographics table and policies
-- supabase/migrations/[timestamp]_create_demographics_table.sql

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create demographics table
create table demographics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null unique,
  age integer not null,
  gender text not null,
  state text not null,
  race_ethnicity text not null,
  income_bracket text not null,
  occupation text not null,
  political_party text not null,
  political_leaning text not null,
  employment_status text not null,
  citizenship_status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger demographics_updated_at
  before update on demographics
  for each row
  execute function handle_updated_at();

-- Create RLS policies for demographics
alter table demographics enable row level security;

create policy "Users can read their own demographics"
  on demographics for select
  using (auth.uid() = user_id);

create policy "Users can insert their own demographics"
  on demographics for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own demographics"
  on demographics for update
  using (auth.uid() = user_id);

-- Add indexes
create index demographics_user_id_idx on demographics(user_id);