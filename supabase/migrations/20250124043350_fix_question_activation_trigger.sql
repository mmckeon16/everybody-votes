-- -- 1. Enable pg_net extension
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- -- 2. Create or replace the trigger function
-- CREATE OR REPLACE FUNCTION public.invoke_push_notification_function()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- BEGIN
--   PERFORM
--     net.http_post(
--       'https://nkaenbgnlfcqzjqnforj.supabase.co/functions/v1/push-notifications',
--       'POST',
--       'Content-Type: application/json',
--       '{"type":"UPDATE","table":"questions","record":' || row_to_json(NEW)::text || ',"old_record":' || row_to_json(OLD)::text || '}'
--     );

--   RETURN NEW;
-- END;
-- $$;

-- -- 3. Drop existing trigger if it exists
-- DROP TRIGGER IF EXISTS on_question_active ON questions;

-- -- 4. Create the trigger
-- CREATE TRIGGER on_question_active
-- AFTER UPDATE ON questions
-- FOR EACH ROW
-- WHEN (NEW.is_active = true AND (OLD.is_active = false OR OLD.is_active IS NULL))
-- EXECUTE FUNCTION public.invoke_push_notification_function();

-- -- 5. Add a comment to the trigger
-- COMMENT ON TRIGGER on_question_active ON questions IS 'Triggers push notifications when a question becomes active';