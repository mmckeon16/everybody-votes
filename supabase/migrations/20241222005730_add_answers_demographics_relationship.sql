-- Add foreign key relationship between answers and demographics tables
ALTER TABLE "public"."answers"
ADD CONSTRAINT "answers_user_id_demographics_fkey"
FOREIGN KEY (user_id)
REFERENCES "public"."demographics"(user_id)
NOT VALID;

-- Validate the constraint
ALTER TABLE "public"."answers"
VALIDATE CONSTRAINT "answers_user_id_demographics_fkey";