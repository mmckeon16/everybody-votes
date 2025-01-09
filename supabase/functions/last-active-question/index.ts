import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    // Get user ID from query params
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    // Format the current time in ISO 8601 format
    const currentTime = new Date().toISOString();

    // Get the last completed question (end_date < current time, ordered by end_date desc)
    const { data: lastQuestion, error } = await supabase
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
      .lt('end_date', currentTime)
      .order('end_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!lastQuestion) {
      console.log('No previous questions found');
      return new Response(
        JSON.stringify({ message: 'No previous questions found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // If user is authenticated, get their answer
    let user_vote = null;
    if (userId) {
      const { data: answer, error: answerError } = await supabase
        .from('answers')
        .select('option_id')
        .eq('user_id', userId)
        .in(
          'option_id',
          lastQuestion.options.map((opt: any) => opt.id)
        )
        .maybeSingle();

      if (answerError) {
        console.error('Error fetching user answer:', answerError);
      } else if (answer) {
        user_vote = answer.option_id;
      }
    }

    console.log('Successfully fetched last question:', lastQuestion);
    return new Response(JSON.stringify({ ...lastQuestion, user_vote }), {
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
