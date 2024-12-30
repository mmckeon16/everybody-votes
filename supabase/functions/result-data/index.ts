import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { parseAgeRanges } from './utils.ts';

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

    // Get the question and its options
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

    const optionIds = questionData.options.map((opt) => opt.id);
    console.log('optionIds', optionIds);

    let answersQuery = supabase.from('answers_with_demographics').select('*');
    // .in('option_id', optionIds);
    console.log('answersQuery before any filters', await answersQuery.data);

    //Now lets check if there are any filters

    console.log('url searchParams', url.searchParams);
    if (url.searchParams.size !== 0) {
      console.log('WE HAVE FILTERS!!!!!!!!!!!!');
      // Get demographic filters from query params
      const demographicFilters: Record<string, string[]> = {};
      //TODO: This needs to be updated to match the new demographics table, and we should just use the type of the demographics table
      const validDemographicFields = [
        'age',
        'gender',
        'state',
        'race_ethnicity',
        'income_bracket',
        'occupation',
        'political_party',
        'political_leaning',
        'employment_status',
        'citizenship_status',
      ];

      validDemographicFields.forEach((field) => {
        const values = url.searchParams.getAll(field);
        console.log('values', values);
        if (values.length > 0) {
          demographicFilters[field] = values;
        }
      });

      // start with age filter
      if (demographicFilters.age) {
        const ageRanges = parseAgeRanges(demographicFilters.age);
        const ageConditions = ageRanges
          .map(({ min, max }) => `or(and(age.gte.${min},age.lte.${max}))`)
          .join(',');

        console.log('ageConditions', ageConditions);

        const { data: answersBeforeAgeFilter } = await answersQuery;
        console.log('answersBeforeAgeFilter', answersBeforeAgeFilter);
        console.log('ageConditions', ageConditions);

        answersQuery = answersQuery.or(ageConditions);
        const { data: answersAfterAgeFiler, error: answersError } =
          await answersQuery;

        console.log('answersQuery after age filter', answersAfterAgeFiler);
        console.log('answersError', answersError);
      }

      // Add the rest of the demographic filters to the query
      if (Object.keys(demographicFilters).length > 0) {
        // Build the filter conditions
        console.log('demographicFilters', demographicFilters);
        const filterConditions = Object.entries(demographicFilters).reduce<
          { [key: string]: string[] }[]
        >((acc, [field, values]) => {
          // skip age filter since we already applied it
          if (field !== 'age') {
            acc.push({ [field]: values });
          }
          return acc;
        }, []);

        console.log('filterConditions', filterConditions);

        // Apply filters using proper PostgREST syntax
        filterConditions.forEach((condition) => {
          const field = Object.keys(condition)[0];
          const values = Object.values(condition)[0];
          let filterString = values
            .map((value) => `${field}.eq.${value}`)
            .join(',');
          answersQuery = answersQuery.or(filterString);
        });
      }
    } else {
      console.log('NO FILTERS!!!!!!!!!!!!');
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
      // appliedFilters: demographicFilters,
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
