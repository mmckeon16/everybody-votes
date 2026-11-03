import type { PollResult, StateResult, StateVoteOption } from '../app/lib/api/results';

export function stateVoteOptions(
  row: StateResult,
  results: Pick<PollResult, 'optionId' | 'optionText'>[]
): StateVoteOption[] {
  return results.map(option => {
    const value = row[option.optionId];
    const votes = typeof value === 'object' && value !== null &&
      Number.isFinite(value.votes) && value.votes >= 0 ? value.votes : 0;
    return { text: option.optionText, votes };
  });
}
