-- Remove the old constraint name and replace with proper relationships to auth.users
ALTER TABLE "public"."answers"
ADD CONSTRAINT "answers_user_id_fkey"
FOREIGN KEY (user_id)
REFERENCES auth.users(id);