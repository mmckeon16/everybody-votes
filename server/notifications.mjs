const date = value => new Date(value).toLocaleDateString('en-US', { timeZone: 'UTC' });

export function notificationPayload(destination, event, env) {
  const log = event.payload;
  if (destination === 'discord') {
    const fields = [
      { name: 'Execution Time', value: log.executed_at ?? event.created_at, inline: true },
      { name: 'Questions Deactivated', value: String(log.deactivated_questions ?? 0), inline: true },
    ];
    if (log.success && log.questions) {
      fields.push(
        { name: 'New Active Question', value: log.questions.text.slice(0, 1024), inline: false },
        { name: 'Question Period', value: `From ${date(log.questions.start_date)} to ${date(log.questions.end_date)}`, inline: false },
      );
    } else if (log.success && log.activated_question_id) {
      fields.push({ name: 'Activated Question', value: log.activated_question_id, inline: false });
    }
    if (!log.success && log.error_message) {
      fields.push({ name: 'Error Message', value: log.error_message.slice(0, 1024), inline: false });
    }
    return { username: 'Question Rotation Bot', allowed_mentions: { parse: [] }, embeds: [{
      title: log.success ? 'Question Rotation Successful' : 'Question Rotation Failed',
      color: log.success ? 5763719 : 15548997, fields, timestamp: log.executed_at ?? event.created_at,
    }] };
  }
  if (destination === 'onesignal') {
    return { app_id: env.ONESIGNAL_APP_ID, included_segments: [env.ONESIGNAL_SEGMENT || 'Subscribed Users'], target_channel: 'push',
      headings: { en: 'New Poll!' },
      contents: { en: `New question available: "${log.record.text}". Available until ${date(log.record.end_date)}` },
      data: { questionId: log.record.id }, idempotency_key: event.id };
  }
  return { id: event.id, event: event.event_type, created_at: event.created_at, ...log };
}
