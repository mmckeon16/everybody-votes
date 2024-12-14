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

    const { data: voteCounts, error: countError } = await supabase
      .from('answers')
      .select('option_id, count(*)')
      .in(
        'option_id',
        questionData.options.map((opt) => opt.id)
      )
      .group('option_id'); // This groups and counts rows by `option_id`.

    if (countError) throw countError;

    // Transform the data
    const voteMap = Object.fromEntries(
      voteCounts.map((vc) => [vc.option_id, parseInt(vc.count)])
    );

    const totalVotes = Object.values(voteMap).reduce(
      (sum, count) => sum + count,
      0
    );

    const results = questionData.options.map((option) => ({
      optionId: option.id,
      text: option.text,
      votes: voteMap[option.id] || 0,
      percentage:
        totalVotes > 0 ? ((voteMap[option.id] || 0) / totalVotes) * 100 : 0,
    }));

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
    return new Response(JSON.stringify({ error: error?.message }), {
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
