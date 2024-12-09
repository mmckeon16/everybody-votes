CREATE TABLE public.demographics (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    country_residence TEXT NOT NULL,
    race_ethnicity TEXT NOT NULL,
    income_bracket TEXT NOT NULL,
    political_affiliation TEXT NOT NULL,
    occupation TEXT NOT NULL,
    country_origin TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON demographics
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime();