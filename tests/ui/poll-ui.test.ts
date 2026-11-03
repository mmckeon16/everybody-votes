import { predictionAvailability } from '../../lib/prediction-availability';
import { stateVoteOptions } from '../../lib/state-vote-options';

const now = Date.parse('2026-11-02T12:00:00Z');
const question = {
  is_active: true,
  end_date: '2026-11-02T13:00:00Z',
  options: [{ id: 'coffee', text: 'Coffee' }, { id: 'tea', text: 'Tea' }],
};

test('predictions are available only while a complete poll is open', () => {
  expect(predictionAvailability(question, now)).toBe('ready');
  expect(predictionAvailability(null, now)).toBe('unavailable');
  expect(predictionAvailability({ ...question, options: [] }, now)).toBe('unavailable');
  expect(predictionAvailability({ ...question, end_date: 'invalid' }, now)).toBe('unavailable');
});

test('closed or deactivated polls reject predictions at the exact deadline', () => {
  expect(predictionAvailability(question, Date.parse(question.end_date))).toBe('ended');
  expect(predictionAvailability(question, Date.parse(question.end_date) + 1)).toBe('ended');
  expect(predictionAvailability({ ...question, is_active: false }, now)).toBe('ended');
});

test('map labels and option order come from the poll, not state object insertion order', () => {
  expect(stateVoteOptions({
    state: 'NY', totalVotes: 7,
    tea: { text: 'stale second label', votes: 5 },
    coffee: { text: 'stale first label', votes: 2 },
  }, [
    { optionId: 'coffee', optionText: 'Coffee' },
    { optionId: 'tea', optionText: 'Tea' },
  ])).toEqual([{ text: 'Coffee', votes: 2 }, { text: 'Tea', votes: 5 }]);
});

test('empty state counts keep actual labels and never invent Yes or No', () => {
  expect(stateVoteOptions({ state: 'NY', totalVotes: 0 }, [
    { optionId: 'coffee', optionText: 'Coffee' },
    { optionId: 'tea', optionText: 'Tea' },
  ])).toEqual([{ text: 'Coffee', votes: 0 }, { text: 'Tea', votes: 0 }]);
  expect(stateVoteOptions({ state: 'NY', totalVotes: 0 }, [])).toEqual([]);
});
