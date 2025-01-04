// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('EXPO_PUBLIC_SUPABASE_ANON_KEY') ?? ''
);

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user ID from query params
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    console.log('Fetching active question...');
    const { data: activeQuestion, error } = await supabase
      .from('questions')
      .select(
        `
        id,
        text,
        options (
          id,
          text
        ),
        start_date,
        end_date,
        is_active
      `
      )
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!activeQuestion) {
      console.log('No active question found');
      return new Response(
        JSON.stringify({ message: 'No active question found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // If user is authenticated, get their answer
    let user_vote = null;
    console.log('userId', userId);
    if (userId) {
      const { data: answer, error: answerError } = await supabase
        .from('answers')
        .select('option_id')
        .eq('user_id', userId)
        .in(
          'option_id',
          activeQuestion.options.map((opt: any) => opt.id)
        )
        .maybeSingle();

      if (answerError) {
        console.error('Error fetching user answer:', answerError);
      } else if (answer) {
        user_vote = answer.option_id;
      }
    }

    console.log('Successfully fetched active question:', activeQuestion);
    return new Response(JSON.stringify({ ...activeQuestion, user_vote }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/active-question' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
