create sequence "public"."options_id_seq";

create table "public"."options" (
    "id" uuid not null default gen_random_uuid(),
    "question_id" uuid not null,
    "text" text not null
);


create table "public"."questions" (
    "id" uuid not null default gen_random_uuid(),
    "text" text not null,
    "start_date" timestamp with time zone not null,
    "end_date" timestamp with time zone not null,
    "is_active" boolean default false
);


alter sequence "public"."options_id_seq" owned by "public"."options"."id";

CREATE UNIQUE INDEX options_pkey ON public.options USING btree (id);

CREATE UNIQUE INDEX questions_pkey ON public.questions USING btree (id);

alter table "public"."options" add constraint "options_pkey" PRIMARY KEY using index "options_pkey";

alter table "public"."questions" add constraint "questions_pkey" PRIMARY KEY using index "questions_pkey";

alter table "public"."options" add constraint "options_question_id_fkey" FOREIGN KEY (question_id) REFERENCES questions(id) not valid;

alter table "public"."options" validate constraint "options_question_id_fkey";

grant delete on table "public"."options" to "anon";

grant insert on table "public"."options" to "anon";

grant references on table "public"."options" to "anon";

grant select on table "public"."options" to "anon";

grant trigger on table "public"."options" to "anon";

grant truncate on table "public"."options" to "anon";

grant update on table "public"."options" to "anon";

grant delete on table "public"."options" to "authenticated";

grant insert on table "public"."options" to "authenticated";

grant references on table "public"."options" to "authenticated";

grant select on table "public"."options" to "authenticated";

grant trigger on table "public"."options" to "authenticated";

grant truncate on table "public"."options" to "authenticated";

grant update on table "public"."options" to "authenticated";

grant delete on table "public"."options" to "service_role";

grant insert on table "public"."options" to "service_role";

grant references on table "public"."options" to "service_role";

grant select on table "public"."options" to "service_role";

grant trigger on table "public"."options" to "service_role";

grant truncate on table "public"."options" to "service_role";

grant update on table "public"."options" to "service_role";

grant delete on table "public"."questions" to "anon";

grant insert on table "public"."questions" to "anon";

grant references on table "public"."questions" to "anon";

grant select on table "public"."questions" to "anon";

grant trigger on table "public"."questions" to "anon";

grant truncate on table "public"."questions" to "anon";

grant update on table "public"."questions" to "anon";

grant delete on table "public"."questions" to "authenticated";

grant insert on table "public"."questions" to "authenticated";

grant references on table "public"."questions" to "authenticated";

grant select on table "public"."questions" to "authenticated";

grant trigger on table "public"."questions" to "authenticated";

grant truncate on table "public"."questions" to "authenticated";

grant update on table "public"."questions" to "authenticated";

grant delete on table "public"."questions" to "service_role";

grant insert on table "public"."questions" to "service_role";

grant references on table "public"."questions" to "service_role";

grant select on table "public"."questions" to "service_role";

grant trigger on table "public"."questions" to "service_role";

grant truncate on table "public"."questions" to "service_role";

grant update on table "public"."questions" to "service_role";


