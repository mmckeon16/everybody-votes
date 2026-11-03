interface PredictionQuestion {
  is_active?: boolean;
  end_date?: string;
  options?: { id: string; text: string }[];
}

export function predictionAvailability(
  question: PredictionQuestion | null | undefined,
  now: number = Date.now()
): 'unavailable' | 'ended' | 'ready' {
  if (!question) return 'unavailable';
  const end = Date.parse(question.end_date ?? '');
  if (question.is_active === false || (Number.isFinite(end) && end <= now)) return 'ended';
  if (!Number.isFinite(end) || !Array.isArray(question.options) || question.options.length < 2) return 'unavailable';
  return 'ready';
}
