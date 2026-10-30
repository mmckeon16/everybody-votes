-- Each external destination has an independent delivery record and retry state.
CREATE TABLE public.hook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.hook_deliveries (
  event_id uuid NOT NULL REFERENCES public.hook_events(id) ON DELETE CASCADE,
  destination text NOT NULL, attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(), delivered_at timestamptz, last_error text,
  PRIMARY KEY (event_id, destination)
);
CREATE INDEX hook_deliveries_pending_idx ON public.hook_deliveries(available_at) WHERE delivered_at IS NULL;

CREATE FUNCTION public.enqueue_question_activation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_active AND (TG_OP = 'INSERT' OR NOT OLD.is_active) THEN
    INSERT INTO public.hook_events(event_type, payload)
    VALUES ('question.activated', jsonb_build_object(
      'type', TG_OP, 'table', 'questions', 'schema', 'public', 'record', to_jsonb(NEW),
      'old_record', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER question_activation_hook AFTER INSERT OR UPDATE OF is_active ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.enqueue_question_activation();

CREATE FUNCTION public.enqueue_rotation_notification() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.hook_events(event_type, payload)
  VALUES ('question.rotation', to_jsonb(NEW));
  RETURN NEW;
END $$;
CREATE TRIGGER question_rotation_hook AFTER INSERT ON public.question_rotation_logs
FOR EACH ROW EXECUTE FUNCTION public.enqueue_rotation_notification();

CREATE FUNCTION public.rotate_active_question() RETURNS void LANGUAGE plpgsql AS $$
DECLARE deactivated_count integer; new_active_id uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(18271102);
  UPDATE public.questions SET is_active = false WHERE is_active AND end_date <= now();
  GET DIAGNOSTICS deactivated_count = ROW_COUNT;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE is_active) THEN
    SELECT id INTO new_active_id FROM public.questions
    WHERE start_date <= now() AND end_date > now()
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

REVOKE ALL ON public.hook_events, public.hook_deliveries FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rotate_active_question() FROM PUBLIC;
