import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const questionId = pathParts[pathParts.length - 1];

    console.log('Processing request for questionId:', questionId);

    // First get the question and its options
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select(
        `
        id,
        text,
        options (
          id,
          text
        )
      `
      )
      .eq('id', questionId)
      .single();

    if (questionError) throw questionError;
    console.log('Question data:', questionData);

    // Get all answers for this question's options
    const optionIds = questionData.options.map((opt) => opt.id);
    console.log('Looking for answers with option_ids:', optionIds);

    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select(
        `
        id,
        user_id,
        option_id,
        demographics (
          age,
          gender,
          country_residence,
          race_ethnicity,
          income_bracket,
          political_affiliation,
          occupation,
          country_origin
        )
      `
      )
      .in('option_id', optionIds);

    console.log('Raw answers query result:', { answers, answersError });

    // If we still get no answers, let's try a simple answers query
    const { data: simpleAnswers, error: simpleError } = await supabase
      .from('answers')
      .select('*');

    console.log('Simple answers query result:', { simpleAnswers, simpleError });

    if (answersError) throw answersError;
    console.log('Answers data:', answers);

    // Process vote counts
    const voteCounts = answers.reduce((acc, answer) => {
      acc[answer.option_id] = (acc[answer.option_id] || 0) + 1;
      return acc;
    }, {});

    const totalVotes = Object.values(voteCounts).reduce(
      (sum: number, count: number) => sum + count,
      0
    );

    // Format results
    const results = questionData.options.map((option) => ({
      optionId: option.id,
      optionText: option.text,
      votes: voteCounts[option.id] || 0,
      percentage:
        totalVotes > 0 ? ((voteCounts[option.id] || 0) / totalVotes) * 100 : 0,
      responses: answers
        .filter((answer) => answer.option_id === option.id)
        .map((answer) => ({
          userId: answer.user_id,
          demographics: answer.demographics,
        })),
    }));

    return new Response(
      JSON.stringify({
        question: {
          id: questionData.id,
          text: questionData.text,
        },
        results,
        totalVotes,
        voteCounts,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
