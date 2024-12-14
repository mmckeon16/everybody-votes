create table "public"."answers" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid default auth.uid(),
    "option_id" uuid default gen_random_uuid()
);


alter table "public"."answers" enable row level security;

alter table "public"."options" alter column "id" set default uuid_generate_v4();

alter table "public"."options" alter column "id" set data type uuid using "id"::uuid;

CREATE UNIQUE INDEX answers_pkey ON public.answers USING btree (id);

alter table "public"."answers" add constraint "answers_pkey" PRIMARY KEY using index "answers_pkey";

alter table "public"."answers" add constraint "answers_option_id_fkey" FOREIGN KEY (option_id) REFERENCES options(id) not valid;

alter table "public"."answers" validate constraint "answers_option_id_fkey";

-- alter table "public"."answers" add constraint "answers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

-- alter table "public"."answers" validate constraint "answers_user_id_fkey";

grant delete on table "public"."answers" to "anon";

grant insert on table "public"."answers" to "anon";

grant references on table "public"."answers" to "anon";

grant select on table "public"."answers" to "anon";

grant trigger on table "public"."answers" to "anon";

grant truncate on table "public"."answers" to "anon";

grant update on table "public"."answers" to "anon";

grant delete on table "public"."answers" to "authenticated";

grant insert on table "public"."answers" to "authenticated";

grant references on table "public"."answers" to "authenticated";

grant select on table "public"."answers" to "authenticated";

grant trigger on table "public"."answers" to "authenticated";

grant truncate on table "public"."answers" to "authenticated";

grant update on table "public"."answers" to "authenticated";

grant delete on table "public"."answers" to "service_role";

grant insert on table "public"."answers" to "service_role";

grant references on table "public"."answers" to "service_role";

grant select on table "public"."answers" to "service_role";

grant trigger on table "public"."answers" to "service_role";

grant truncate on table "public"."answers" to "service_role";

grant update on table "public"."answers" to "service_role";


