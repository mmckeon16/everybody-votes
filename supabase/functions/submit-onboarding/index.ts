// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { isDevelopmentEnvironment } from '../_shared/environment.ts';

interface OnboardingData {
  user_id: string;
  age: number;
  gender: string;
  country_residence: string;
  race_ethnicity: string;
  income_bracket: string;
  political_affiliation: string;
  occupation: string;
  country_origin: string;
}

serve(async (req) => {
  const isDevelopment = isDevelopmentEnvironment();

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { onboarding } = (await req.json()) as { onboarding: OnboardingData };

    console.log('Checking user:', onboarding.user_id);

    if (!isDevelopment) {
      // Only check auth in production
      const {
        data: { user },
        error: userError,
      } = await supabaseClient.auth.admin.getUserById(onboarding.user_id);

      if (userError || !user) {
        console.error('User lookup error:', userError);
        throw new Error(`User ${onboarding.user_id} not found`);
      }
    }

    // Check if demographics already exist for this user
    const { data: existingDemographics, error: checkError } =
      await supabaseClient
        .from('demographics')
        .select('id')
        .eq('user_id', onboarding.user_id)
        .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      console.error('Error checking existing demographics:', checkError);
      throw checkError;
    }

    //if demographics already exist, in production, throw an error
    //if in development, delete the existing demographics for this user
    //and update user metadata to mark profile as incomplete
    if (existingDemographics) {
      if (!isDevelopment)
        throw new Error(
          'Demographics already exist for this user. Please use the update endpoint.'
        );

      //if in development, delete the existing demographics for this user
      await supabaseClient
        .from('demographics')
        .delete()
        .eq('user_id', onboarding.user_id);

      //update user metadata to mark profile as incomplete
      await supabaseClient.auth.admin.updateUserById(onboarding.user_id, {
        user_metadata: {
          completed_profile: false,
        },
      });
    }

    // Then insert into demographics
    // Let's break this into steps for clarity
    console.log('Inserting demographics:', onboarding);

    const insertResponse = await supabaseClient
      .from('demographics')
      .insert(onboarding);

    console.log('Insert response:', insertResponse);

    if (insertResponse.error) {
      console.error('Insert error:', insertResponse.error);
      throw insertResponse.error;
    }

    // After successful insert, get the inserted row
    const { data, error } = await supabaseClient
      .from('demographics')
      .select()
      .eq('user_id', onboarding.user_id)
      .single();

    if (error) {
      console.error('Select error:', error);
      throw error;
    }

    // Update auth metadata to mark profile as completed
    const { error: updateError } =
      await supabaseClient.auth.admin.updateUserById(onboarding.user_id, {
        user_metadata: {
          completed_profile: true,
        },
      });

    if (updateError) {
      console.error('Error updating user metadata:', updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/submit-onboarding' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
