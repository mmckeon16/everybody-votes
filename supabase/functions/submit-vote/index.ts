import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { isDevelopmentEnvironment } from '../_shared/environment.ts';

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    //create supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { optionId, userId } = await req.json();
    const isDevelopment = isDevelopmentEnvironment();

    // Check for existing vote
    const { data: existingVote, error: checkError } = await supabaseClient
      .from('answers')
      .select('id')
      .eq('user_id', userId)
      .eq('option_id', optionId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    console.log('In submit-vote');
    console.log('existingVote', existingVote);
    console.log('optionId', optionId);
    console.log('userId', userId);
    console.log('isDevelopment', isDevelopment);

    if (existingVote) {
      if (!isDevelopment) {
        throw new Error('User has already voted for this option');
      }
      // In development, delete the existing vote
      await supabaseClient
        .from('answers')
        .delete()
        .eq('user_id', userId)
        .eq('option_id', optionId);
    }

    // Insert the new vote
    const { data, error } = await supabaseClient.from('answers').insert({
      option_id: optionId,
      user_id: userId,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
