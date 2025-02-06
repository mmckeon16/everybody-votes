// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

Deno.serve(async req => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the most recent log entry
    const { data: log, error } = await supabase
      .from('question_rotation_logs')
      .select(
        `
        *,
        questions!question_rotation_logs_activated_question_id_fkey (
          text,
          start_date,
          end_date
        )
      `
      )
      .order('executed_at', { ascending: false })
      .limit(1)
      .single();

    // Get all device tokens
    const { data: devices, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token')
      .order('last_active', { ascending: false });

    if (error) throw error;

    if (tokensError) {
      throw new Error('Failed to fetch push tokens');
    }

    // Format the notification message
    const endDate = new Date(log.questions.end_date).toLocaleDateString();
    const notificationBody = `New question available: "${log.questions.text}". Available until ${endDate}`;

    // Prepare messages for all devices
    const messages = devices.map(device => ({
      to: device.token,
      sound: 'default',
      title: 'New Poll!',
      body: notificationBody,
      data: { questionId: log.questions.id },
    }));
    // Send to Expo's push notification service
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/push-notifications' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
