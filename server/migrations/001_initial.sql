-- Render-specific baseline. Keep the original Supabase migration history intact.
-- Supabase Auth owns auth.users; start the Auth service before applying this file.
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL CHECK (length(trim(text)) > 0),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL CHECK (end_date > start_date),
  is_active boolean NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX one_active_question ON public.questions ((is_active)) WHERE is_active;
CREATE TABLE public.options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  text text NOT NULL,
  UNIQUE (id, question_id)
);
CREATE INDEX options_question_id_idx ON public.options(question_id);

CREATE TABLE public.demographics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  age integer NOT NULL CHECK (age BETWEEN 1 AND 115),
  gender text NOT NULL, state text NOT NULL, race_ethnicity text NOT NULL,
  income_bracket text NOT NULL, occupation text NOT NULL, political_party text NOT NULL,
  political_leaning text NOT NULL, employment_status text NOT NULL, citizenship_status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id),
  option_id uuid NOT NULL,
  FOREIGN KEY (option_id, question_id) REFERENCES public.options(id, question_id),
  UNIQUE (user_id, question_id)
);
CREATE INDEX answers_question_id_idx ON public.answers(question_id);
CREATE TABLE public.predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id),
  option_id uuid NOT NULL,
  FOREIGN KEY (option_id, question_id) REFERENCES public.options(id, question_id),
  UNIQUE (user_id, question_id)
);
CREATE TABLE public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);
CREATE TABLE public.question_rotation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), executed_at timestamptz NOT NULL DEFAULT now(),
  deactivated_questions integer NOT NULL DEFAULT 0,
  activated_question_id uuid REFERENCES public.questions(id),
  success boolean NOT NULL, error_message text
);
CREATE VIEW public.answers_with_demographics AS
SELECT a.*, d.age, d.gender, d.state, d.race_ethnicity, d.income_bracket,
  d.occupation, d.political_party, d.political_leaning, d.employment_status, d.citizenship_status
FROM public.answers a LEFT JOIN public.demographics d ON d.user_id = a.user_id;

CREATE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER demographics_updated_at BEFORE UPDATE ON public.demographics
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER push_tokens_updated_at BEFORE UPDATE ON public.push_tokens
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- HTTP clients never connect directly to Postgres. API sessions enforce ownership.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
