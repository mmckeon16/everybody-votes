create table "public"."predictions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid default auth.uid(),
    "option_id" uuid not null,
    constraint "predictions_pkey" primary key ("id"),
    constraint "predictions_option_id_fkey" foreign key ("option_id") references "public"."options"("id")
);

-- Enable RLS
alter table "public"."predictions" enable row level security;

-- Create policies
create policy "Enable read access for all users" on "public"."predictions"
    for select
    using (true);

create policy "Enable insert for authenticated users only" on "public"."predictions"
    for insert
    with check (auth.uid() = user_id);

-- Grant permissions
grant select on table "public"."predictions" to "authenticated";
grant insert on table "public"."predictions" to "authenticated";