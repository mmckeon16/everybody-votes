import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors';

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
    // Get questionId from URL path
    const url = new URL(req.url);
    const questionId = url.pathname.split('/').pop();

    console.log('HERE IN RESULTS CALL: ', questionId);

    if (!questionId) {
      throw new Error('Question ID is required');
    }

    const { data: answers, error } = await supabase
      .from('answers')
      .select(
        `
        id,
        created_at,
        options (
          id,
          text,
          question_id,
          questions (
            id,
            text
          )
        ),
        users (
          id,
          email
        )
      `
      )
      .eq('options.question_id', questionId);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!answers) {
      console.log('No answers found');
      return new Response(JSON.stringify({ message: 'No answers found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully fetched answers:', answers);
    return new Response(JSON.stringify(answers), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
