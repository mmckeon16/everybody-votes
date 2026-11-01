-- Snapshot the activated question with each rotation event, matching the original
-- Discord report without looking up whichever rotation happens to be latest.
CREATE OR REPLACE FUNCTION public.enqueue_rotation_notification() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE question_data jsonb;
BEGIN
  SELECT jsonb_build_object('id', id, 'text', text, 'start_date', start_date, 'end_date', end_date)
  INTO question_data FROM public.questions WHERE id = NEW.activated_question_id;
  INSERT INTO public.hook_events(event_type, payload)
  VALUES ('question.rotation', to_jsonb(NEW) || jsonb_build_object('questions', question_data));
  RETURN NEW;
END $$;
