-- Drafts have no public schedule and must never be activated by the cron.
ALTER TABLE public.questions
  ADD COLUMN is_draft boolean NOT NULL DEFAULT false,
  ALTER COLUMN start_date DROP NOT NULL,
  ALTER COLUMN end_date DROP NOT NULL,
  ADD CONSTRAINT questions_draft_inactive CHECK (NOT is_draft OR NOT is_active),
  ADD CONSTRAINT questions_published_schedule CHECK (is_draft OR (start_date IS NOT NULL AND end_date IS NOT NULL));

CREATE OR REPLACE FUNCTION public.rotate_active_question() RETURNS void LANGUAGE plpgsql AS $$
DECLARE deactivated_count integer; new_active_id uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(18271102);
  UPDATE public.questions SET is_active = false WHERE is_active AND end_date <= now();
  GET DIAGNOSTICS deactivated_count = ROW_COUNT;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE is_active) THEN
    SELECT id INTO new_active_id FROM public.questions
    WHERE NOT is_draft AND start_date <= now() AND end_date > now()
    ORDER BY start_date, id LIMIT 1 FOR UPDATE;
    IF new_active_id IS NOT NULL THEN
      UPDATE public.questions SET is_active = true WHERE id = new_active_id;
    END IF;
  END IF;
  IF deactivated_count > 0 OR new_active_id IS NOT NULL THEN
    INSERT INTO public.question_rotation_logs(deactivated_questions, activated_question_id, success)
    VALUES (deactivated_count, new_active_id, true);
  END IF;
END $$;
