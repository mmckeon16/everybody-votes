INSERT INTO public.questions (id, text, start_date, end_date, is_active)
VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'What is your favorite color?', NOW(), NOW() + INTERVAL '1 day', true);

INSERT INTO public.options (id, question_id, text)
VALUES
    ('123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Red'),
    ('123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'Blue'),
    ('123e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174000', 'Green');

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('512de29f-cb74-4912-9b4a-c3569e03d7c1', 'ngattusohw@gmail.com', '$2a$10$abc123', NOW(), NOW(), NOW());

INSERT INTO public.answers (id, user_id, option_id, created_at)
VALUES
    ('123e4567-e89b-12d3-a456-426614174101', '512de29f-cb74-4912-9b4a-c3569e03d7c1', '123e4567-e89b-12d3-a456-426614174001', NOW()), -- Vote for Red
    ('123e4567-e89b-12d3-a456-426614174102', '456e4567-e89b-12d3-a456-426614100001', '123e4567-e89b-12d3-a456-426614174002', NOW()), -- Vote for Blue
    ('123e4567-e89b-12d3-a456-426614174103', '456e4567-e89b-12d3-a456-426614100002', '123e4567-e89b-12d3-a456-426614174002', NOW()), -- Vote for Blue
    ('123e4567-e89b-12d3-a456-426614174104', '456e4567-e89b-12d3-a456-426614100003', '123e4567-e89b-12d3-a456-426614174003', NOW()); -- Vote for Green