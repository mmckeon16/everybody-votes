-- Enable read access to answers table for all authenticated users
CREATE POLICY "Enable read access for all users" ON "public"."answers"
    FOR SELECT
    USING (true);

-- If you want to allow anonymous access as well
ALTER TABLE "public"."answers" ENABLE ROW LEVEL SECURITY;
-- GRANT SELECT ON "public"."answers" TO anon;
GRANT SELECT ON "public"."answers" TO authenticated;

-- Do the same for demographics table
CREATE POLICY "Enable read access for all users" ON "public"."demographics"
    FOR SELECT
    USING (true);

ALTER TABLE "public"."demographics" ENABLE ROW LEVEL SECURITY;
-- GRANT SELECT ON "public"."demographics" TO anon;
GRANT SELECT ON "public"."demographics" TO authenticated;