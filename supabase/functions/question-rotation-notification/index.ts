import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async req => {
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

    if (error) throw error;

    //DISCORD WEBHOOK
    // Prepare the webhook message
    const webhookBody = {
      username: 'Question Rotation Bot',
      // avatar_url: 'https://your-avatar-url.png', // Optional: Add your bot's avatar
      embeds: [
        {
          title: log.success
            ? 'Question Rotation Successful'
            : 'Question Rotation Failed',
          color: log.success ? 5763719 : 15548997, // Green for success, Red for failure
          fields: [
            {
              name: 'Execution Time',
              value: new Date(log.executed_at).toLocaleString(),
              inline: true,
            },
            {
              name: 'Questions Deactivated',
              value: log.deactivated_questions?.toString() || '0',
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // Add new question info if there is one
    if (log.success && log.questions) {
      webhookBody.embeds[0].fields.push(
        {
          name: 'New Active Question',
          value: log.questions.text,
          inline: false,
        },
        {
          name: 'Question Period',
          value: `From ${new Date(
            log.questions.start_date
          ).toLocaleDateString()} to ${new Date(
            log.questions.end_date
          ).toLocaleDateString()}`,
          inline: false,
        }
      );
    }

    // Add error message if there was one
    if (!log.success && log.error_message) {
      webhookBody.embeds[0].fields.push({
        name: 'Error Message',
        value: `\`\`\`${log.error_message}\`\`\``,
        inline: false,
      });
    }

    // Send the webhook
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookBody),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
