-- First, insert users into auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('512de29f-cb74-4912-9b4a-c3569e03d7c1', 'user1@example.com', '$2a$10$abc123', NOW(), NOW(), NOW()),
  ('f55c3cc2-915c-477b-94be-b9e9381facc6', 'user2@example.com', '$2a$10$abc123', NOW(), NOW(), NOW()),
  ('456e4567-e89b-12d3-a456-426614100002', 'user3@example.com', '$2a$10$abc123', NOW(), NOW(), NOW()),
  ('456e4567-e89b-12d3-a456-426614100003', 'user4@example.com', '$2a$10$abc123', NOW(), NOW(), NOW());

-- Then questions
INSERT INTO public.questions (id, text, start_date, end_date, is_active)
VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'Should there be a federal minimum wage?', NOW(), NOW() + INTERVAL '1 day', true);

-- Then options
INSERT INTO public.options (id, question_id, text)
VALUES
    ('123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Yes'),
    ('123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'No');

-- Then demographics
-- INSERT INTO public.demographics (user_id, age, gender, state, race_ethnicity, income_bracket, political_party, political_leaning, employment_status, citizenship_status)
-- VALUES
--     ('512de29f-cb74-4912-9b4a-c3569e03d7c1', 25, 'male', 'CA', 'white', '50k-75k', 'democrat', 'liberal', 'employed', 'natural-born-citizen'),
--     ('f55c3cc2-915c-477b-94be-b9e9381facc6', 30, 'female', 'NY', 'asian', '75k-100k', 'independent', 'moderate', 'self-employed', 'foreign-born-citizen'),
--     ('456e4567-e89b-12d3-a456-426614100002', 45, 'male', 'TX', 'black', '100k-150k', 'republican', 'conservative', 'employed', 'natural-born-citizen'),
--     ('456e4567-e89b-12d3-a456-426614100003', 35, 'non-binary', 'WA', 'hispanic', '25k-50k', 'green', 'progressive', 'part-time', 'permanent-resident');

-- -- Finally, answers
-- INSERT INTO public.answers (id, user_id, option_id, created_at)
-- VALUES
--     ('123e4567-e89b-12d3-a456-426614174101', '512de29f-cb74-4912-9b4a-c3569e03d7c1', '123e4567-e89b-12d3-a456-426614174001', NOW()), -- Vote for Red
--     ('123e4567-e89b-12d3-a456-426614174102', '456e4567-e89b-12d3-a456-426614100001', 'f55c3cc2-915c-477b-94be-b9e9381facc6', NOW()), -- Vote for Blue
--     ('123e4567-e89b-12d3-a456-426614174103', '456e4567-e89b-12d3-a456-426614100002', '123e4567-e89b-12d3-a456-426614174002', NOW()), -- Vote for Blue
--     ('123e4567-e89b-12d3-a456-426614174104', '456e4567-e89b-12d3-a456-426614100003', '123e4567-e89b-12d3-a456-426614174003', NOW()); -- Vote for Green