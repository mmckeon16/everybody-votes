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

    // Get demographic filters from query params
    const demographicFilters: Record<string, string[]> = {};
    const validDemographicFields = [
      'age',
      'gender',
      'country_residence',
      'race_ethnicity',
      'income_bracket',
      'political_affiliation',
      'occupation',
      'country_origin',
    ];

    validDemographicFields.forEach(field => {
      const values = url.searchParams.getAll(field);
      if (values.length > 0) {
        demographicFilters[field] = values;
      }
    });

    // Get the question and its options (unchanged)
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

    // Get answers for this question's options with demographic filters
    const optionIds = questionData.options.map(opt => opt.id);

    let answersQuery = supabase
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

    // Add demographic filters to the query
    if (Object.keys(demographicFilters).length > 0) {
      // Build the filter conditions
      const filterConditions = Object.entries(demographicFilters).map(
        ([field, values]) => ({
          [`demographics.${field}`]: values,
        })
      );

      // Apply OR condition for multiple values of the same field
      filterConditions.forEach(condition => {
        answersQuery = answersQuery.or(
          `${Object.keys(condition)[0]}.in.(${Object.values(condition)[0].join(
            ','
          )})`
        );
      });
    }

    const { data: answers, error: answersError } = await answersQuery;

    if (answersError) throw answersError;

    // Rest of the processing remains the same
    const voteCounts = answers.reduce((acc, answer) => {
      acc[answer.option_id] = (acc[answer.option_id] || 0) + 1;
      return acc;
    }, {});

    const totalVotes = Object.values(voteCounts).reduce(
      (sum: number, count: number) => sum + count,
      0
    );

    const results = questionData.options.map(option => ({
      optionId: option.id,
      optionText: option.text,
      votes: voteCounts[option.id] || 0,
      percentage:
        totalVotes > 0 ? ((voteCounts[option.id] || 0) / totalVotes) * 100 : 0,
      responses: answers
        .filter(answer => answer.option_id === option.id)
        .map(answer => ({
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
        appliedFilters: demographicFilters,
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
