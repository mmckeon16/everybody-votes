-- migrations/20250117232400_trigger_active_q_notification.sql

-- First, create the function that will be called by the trigger
create or replace function invoke_push_notification_function()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Call your edge function when a question becomes active
  perform
    net.http_post(
      url := 'https://nkaenbgnlfcqzjqnforj.supabase.co/functions/v1/push-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.edge_function_key')
      ),
      body := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )
    );
  
  return NEW;
end;
$$;

-- Then create the trigger
create trigger on_question_active
  after update on questions
  for each row
  when (OLD.is_active = false and NEW.is_active = true)
  execute function invoke_push_notification_function();

-- Add a comment to explain what the trigger does
comment on trigger on_question_active on questions is 'Triggers push notifications when a question becomes active';