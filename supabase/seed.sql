-- First, insert users into auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('512de29f-cb74-4912-9b4a-c3569e03d7c1', 'user1@example.com', '$2a$10$abc123', NOW(), NOW(), NOW()),
  ('456e4567-e89b-12d3-a456-426614100001', 'user2@example.com', '$2a$10$abc123', NOW(), NOW(), NOW()),
  ('456e4567-e89b-12d3-a456-426614100002', 'user3@example.com', '$2a$10$abc123', NOW(), NOW(), NOW()),
  ('456e4567-e89b-12d3-a456-426614100003', 'user4@example.com', '$2a$10$abc123', NOW(), NOW(), NOW());

-- Then questions
INSERT INTO public.questions (id, text, start_date, end_date, is_active)
VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'What is your favorite color?', NOW(), NOW() + INTERVAL '1 day', true);

-- Then options
INSERT INTO public.options (id, question_id, text)
VALUES
    ('123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Red'),
    ('123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'Blue'),
    ('123e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174000', 'Green');

-- Then demographics
INSERT INTO public.demographics (user_id, age, gender, country_residence, race_ethnicity, income_bracket, political_affiliation, occupation, country_origin)
VALUES
    ('512de29f-cb74-4912-9b4a-c3569e03d7c1', 25, 'Male', 'USA', 'White', '50000-75000', 'Independent', 'Engineer', 'USA'),
    ('456e4567-e89b-12d3-a456-426614100001', 30, 'Female', 'Canada', 'Asian', '75000-100000', 'Liberal', 'Teacher', 'China'),
    ('456e4567-e89b-12d3-a456-426614100002', 45, 'Male', 'UK', 'Black', '100000-150000', 'Conservative', 'Doctor', 'Nigeria'),
    ('456e4567-e89b-12d3-a456-426614100003', 35, 'Other', 'Australia', 'Hispanic', '25000-50000', 'Independent', 'Artist', 'Mexico');

-- Finally, answers
INSERT INTO public.answers (id, user_id, option_id, created_at)
VALUES
    ('123e4567-e89b-12d3-a456-426614174101', '512de29f-cb74-4912-9b4a-c3569e03d7c1', '123e4567-e89b-12d3-a456-426614174001', NOW()), -- Vote for Red
    ('123e4567-e89b-12d3-a456-426614174102', '456e4567-e89b-12d3-a456-426614100001', '123e4567-e89b-12d3-a456-426614174002', NOW()), -- Vote for Blue
    ('123e4567-e89b-12d3-a456-426614174103', '456e4567-e89b-12d3-a456-426614100002', '123e4567-e89b-12d3-a456-426614174002', NOW()), -- Vote for Blue
    ('123e4567-e89b-12d3-a456-426614174104', '456e4567-e89b-12d3-a456-426614100003', '123e4567-e89b-12d3-a456-426614174003', NOW()); -- Vote for Green