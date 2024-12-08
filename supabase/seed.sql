INSERT INTO public.questions (id, text, start_date, end_date, is_active)
VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'What is your favorite color?', NOW(), NOW() + INTERVAL '1 day', true);

INSERT INTO public.options (question_id, text)
VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'Red'),
    ('123e4567-e89b-12d3-a456-426614174000', 'Blue'),
    ('123e4567-e89b-12d3-a456-426614174000', 'Green');