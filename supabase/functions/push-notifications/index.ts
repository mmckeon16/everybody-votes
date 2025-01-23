import { createClient } from 'jsr:@supabase/supabase-js@2';

interface User {
  id: string;
  expo_push_token: string;
}

interface Question {
  id: string;
  text: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    is_active: boolean;
  };
  schema: 'public';
  old_record: null | {
    is_active: boolean;
  };
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();

    // Only proceed if this is an UPDATE and is_active changed to true
    if (
      payload.type !== 'UPDATE' ||
      !payload.record.is_active ||
      payload.old_record?.is_active === payload.record.is_active
    ) {
      return new Response(
        JSON.stringify({ message: 'No notification needed' }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the active question details
    const { data: activeQuestion, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', payload.record.id)
      .single();

    if (questionError || !activeQuestion) {
      throw new Error('Failed to fetch question details');
    }

    // Get all active push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token');

    if (tokensError) {
      throw new Error('Failed to fetch push tokens');
    }

    // Format the notification message
    const endDate = new Date(activeQuestion.end_date).toLocaleDateString();
    const notificationBody = `New question available: "${activeQuestion.text}". Available until ${endDate}`;

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
          data: { questionId: activeQuestion.id },
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

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications sent to ${pushTokens.length} users`,
        results,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
