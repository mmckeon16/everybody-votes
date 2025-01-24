// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

Deno.serve(async (req) => {
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

  // Get all active push tokens
  const { data: tokens, error: tokensError } = await supabase
    .from('push_tokens')
    .select('token');

  console.log(tokens);

  if (tokensError) {
    throw new Error('Failed to fetch push tokens');
  }

  // Format the notification message
  const endDate = new Date(log.questions.end_date).toLocaleDateString();
  const notificationBody = `New question available: "${log.questions.text}". Available until ${endDate}`;

  // Send notifications to all tokens in batches
  const pushTokens = tokens.map((t) => t.token);
  const batchSize = 100;
  const batches = [];

  for (let i = 0; i < pushTokens.length; i += batchSize) {
    const batch = pushTokens.slice(i, i + batchSize);
    batches.push(batch);
  }

  const results = await Promise.all(
    batches.map(async (tokenBatch) => {
      const messages = tokenBatch.map((token) => ({
        to: token,
        sound: 'default',
        title: 'New Poll!',
        body: notificationBody,
        data: { questionId: log.questions.id },
      }));

      return fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
        },
        body: JSON.stringify(messages),
      }).then((res) => res.json());
    })
  );

  console.log('results', results);

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/push-notifications' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
