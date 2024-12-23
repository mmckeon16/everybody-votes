import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { isDevelopmentEnvironment } from '../_shared/environment.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { optionId, userId } = await req.json();
    const isDevelopment = isDevelopmentEnvironment();

    console.log(
      `Submitting prediction: optionId=${optionId}, userId=${userId}`
    );
    // Check for existing prediction
    const { data: existingPrediction, error: checkError } = await supabaseClient
      .from('predictions')
      .select('id')
      .eq('user_id', userId)
      .eq('option_id', optionId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingPrediction) {
      if (!isDevelopment) {
        throw new Error('User has already made a prediction for this option');
      }
      // In development, delete the existing prediction
      await supabaseClient
        .from('predictions')
        .delete()
        .eq('user_id', userId)
        .eq('option_id', optionId);
    }

    // Insert the new prediction
    const { data, error } = await supabaseClient.from('predictions').insert({
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
