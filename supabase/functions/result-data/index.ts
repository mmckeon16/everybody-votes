// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extract questionId from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const questionId = pathParts[pathParts.length - 1];

    if (!questionId) {
      throw new Error('questionId is required');
    }

    console.log('Question ID:', questionId);

    // Get question and options
    const { data: questionData, error } = await supabase
      .from('questions')
      .select(
        `
        id,
        text,
        options!inner (
          id,
          text
        )
      `
      )
      .eq('id', questionId)
      .single();

    if (error) throw error;
    console.log('Question Data:', questionData);

    // Get all answers for this question's options
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('*');
    // .select('option_id')
    // .in(
    //   'option_id',
    //   questionData.options.map((opt) => opt.id)
    // );

    console.log('Answers:', answers);

    if (answersError) throw answersError;

    // Count votes manually
    const voteCounts = answers.reduce(
      (counts: Record<string, number>, answer: { option_id: string }) => {
        counts[answer.option_id] = (counts[answer.option_id] || 0) + 1;
        return counts;
      },
      {}
    );
    console.log('Vote Counts:', voteCounts);

    const totalVotes = Object.values(voteCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    console.log('Total Votes:', totalVotes);
    const results = questionData.options.map((option) => ({
      optionId: option.id,
      text: option.text,
      votes: voteCounts[option.id] || 0,
      percentage:
        totalVotes > 0 ? ((voteCounts[option.id] || 0) / totalVotes) * 100 : 0,
    }));
    console.log('Results:', results);

    return new Response(
      JSON.stringify({
        results,
        totalVotes,
        question: {
          id: questionData.id,
          text: questionData.text,
        },
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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/result-data' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
