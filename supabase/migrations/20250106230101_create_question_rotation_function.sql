-- Enable the pg_cron extension (if not already enabled)
create extension if not exists pg_cron;

-- Create a log table for rotation events
create table if not exists question_rotation_logs (
    id uuid primary key default gen_random_uuid(),
    executed_at timestamp with time zone default now(),
    deactivated_questions int,
    activated_question_id uuid,
    success boolean,
    error_message text
);

-- Enhanced function with logging
create or replace function rotate_active_question()
returns void as $$
declare
    current_ts timestamp with time zone;
    deactivated_count int;
    new_active_id uuid;
begin
    current_ts := now();

    -- Deactivate expired questions and get count
    with deactivated as (
        update questions
        set is_active = false
        where is_active = true and end_date < current_ts
        returning id
    )
    select count(*) into deactivated_count from deactivated;

    -- Only activate next question if we just deactivated one
    if deactivated_count > 0 then
        with activated as (
            update questions
            set is_active = true
            where id = (
                select id
                from questions
                where start_date > (
                    select coalesce(
                        (select end_date
                            from questions
                            where is_active = true
                            limit 1),
                        current_ts
                    )
                )
                and not is_active
                order by start_date asc
                limit 1
            )
            returning id
        )
        select id into new_active_id from activated;

        -- Log the rotation
        insert into question_rotation_logs
            (deactivated_questions, activated_question_id, success)
        values
            (deactivated_count, new_active_id, true);
    end if;

exception when others then
    insert into question_rotation_logs
        (success, error_message)
    values
        (false, SQLERRM);
    raise;
end;
$$ language plpgsql;

-- Create cron job to run daily at noon
select cron.schedule(
    'rotate-questions',  -- job name
    '0 12 * * *',       -- every day at 12pm (noon)
    'select rotate_active_question();'
);
