-- Create the questions table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT false
);

-- Create the options table
CREATE TABLE public.options (
    id SERIAL PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES public.questions(id),
    text TEXT NOT NULL
);