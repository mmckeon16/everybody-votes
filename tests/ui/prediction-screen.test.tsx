import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { useActiveQuestion } from '../../app/hooks/useActiveQuestion';
import { usePrediction } from '../../app/hooks/usePrediction';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../../app/context/AuthContext';
import QuestionForm from '../../app/components/QuestionForm';
import Predict from '../../app/screens/predict';

jest.mock('../../app/hooks/useActiveQuestion', () => ({ useActiveQuestion: jest.fn() }));
jest.mock('../../app/hooks/usePrediction', () => ({ usePrediction: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: jest.fn(), Redirect: jest.fn(() => null) }));
jest.mock('../../app/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../app/components/QuestionForm', () => ({ __esModule: true, default: jest.fn(() => null) }));
jest.mock('../../app/lib/supabase', () => ({ supabase: { auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: jest.fn() } } }) } } }));
jest.mock('~/components/ui/button', () => ({ Button: require('react-native').Pressable }), { virtual: true });
jest.mock('~/components/ui/text', () => ({ Text: require('react-native').Text }), { virtual: true });

const now = Date.parse('2026-11-02T12:00:00Z');
const question = {
  id: 'test-question', text: 'Coffee or tea?', is_active: true,
  end_date: '2026-11-02T13:00:00Z', user_vote: 'coffee', user_prediction: null,
  options: [{ id: 'coffee', text: 'Coffee' }, { id: 'tea', text: 'Tea' }],
};
let tree: ReactTestRenderer;
let submit: jest.Mock;
let push: jest.Mock;
let replace: jest.Mock;
let refetch: jest.Mock;

function active(data: unknown, error: unknown = null) {
  jest.mocked(useActiveQuestion).mockReturnValue({ data, error, isLoading: false, refetch } as unknown as ReturnType<typeof useActiveQuestion>);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now });
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  submit = jest.fn().mockResolvedValue(undefined);
  push = jest.fn(); replace = jest.fn(); refetch = jest.fn();
  jest.mocked(usePrediction).mockReturnValue({ mutateAsync: submit, isPending: false } as unknown as ReturnType<typeof usePrediction>);
  jest.mocked(useRouter).mockReturnValue({ push, replace } as unknown as ReturnType<typeof useRouter>);
  jest.mocked(useAuth).mockReturnValue({ session: { user: { id: 'test-user' } }, isLoading: false, isAuthenticated: true, hasCompletedProfile: true } as unknown as ReturnType<typeof useAuth>);
  active(question);
});

afterEach(async () => {
  if (tree) await act(async () => tree.unmount());
  jest.useRealTimers();
});

async function mount() { await act(async () => { tree = create(<Predict />); }); }
function renderedText() { return JSON.stringify(tree.toJSON()); }

test('missing and already-ended polls show recovery actions instead of an empty screen', async () => {
  active(null);
  await mount();
  expect(renderedText()).toContain('No poll is open for predictions right now.');
  expect(renderedText()).toContain('Explore results');
  expect(QuestionForm).not.toHaveBeenCalled();
  active({ ...question, end_date: new Date(now - 1).toISOString() });
  await act(async () => tree.update(<Predict />));
  expect(renderedText()).toContain('This poll has closed.');
  expect(QuestionForm).not.toHaveBeenCalled();
});

test('known prediction shows confirmation instead of a duplicate submission form', async () => {
  active({ ...question, user_prediction: 'coffee' });
  await mount();
  expect(renderedText()).toContain('Your prediction is in.');
  expect(QuestionForm).not.toHaveBeenCalled();
  expect(submit).not.toHaveBeenCalled();
});

test('an open form closes when its deadline passes', async () => {
  await mount();
  expect(QuestionForm).toHaveBeenCalled();
  await act(async () => jest.advanceTimersByTime(60 * 60 * 1000 + 1));
  expect(renderedText()).toContain('This poll has closed.');
});

test('a stale form never submits a prediction after its deadline', async () => {
  await mount();
  const onSubmit = jest.mocked(QuestionForm).mock.calls.at(-1)![0].onSubmit;
  jest.setSystemTime(new Date(question.end_date));
  await act(async () => { await onSubmit(question.options[0]); });
  expect(submit).not.toHaveBeenCalled();
  expect(push).not.toHaveBeenCalled();
  expect(renderedText()).toContain('This poll has closed.');
});

test('network errors remain retryable and successful predictions navigate once', async () => {
  active(null, new Error('Network unavailable'));
  await mount();
  expect(renderedText()).toContain('We could not load this poll.');
  expect(renderedText()).toContain('Try again');
  active(question);
  await act(async () => tree.update(<Predict />));
  const onSubmit = jest.mocked(QuestionForm).mock.calls.at(-1)![0].onSubmit;
  await act(async () => { await onSubmit(question.options[0]); });
  expect(submit).toHaveBeenCalledWith({ optionId: 'coffee', userId: 'test-user', questionId: 'test-question' });
  expect(push).toHaveBeenCalledTimes(1);
  expect(push).toHaveBeenCalledWith('/screens/thanks');
});


test.each([
  [false, false, '/auth'],
  [true, false, '/auth/signup'],
])('prediction links enforce authentication=%s and profile=%s', async (isAuthenticated, hasCompletedProfile, target) => {
  jest.mocked(useAuth).mockReturnValue({ session: isAuthenticated ? { user: { id: 'test-user' } } : null, isLoading: false, isAuthenticated, hasCompletedProfile } as unknown as ReturnType<typeof useAuth>);
  await mount();
  expect(jest.mocked(Redirect).mock.calls.at(-1)?.[0].href).toBe(target);
  expect(QuestionForm).not.toHaveBeenCalled();
  expect(submit).not.toHaveBeenCalled();
});

test('a user without a vote gets an explicit vote-first action', async () => {
  active({ ...question, user_vote: null });
  await mount();
  expect(renderedText()).toContain('Vote before you predict.');
  expect(QuestionForm).not.toHaveBeenCalled();
  const button = tree.root.findAll(node => typeof node.props.onPress === 'function' && node.findAll(text => text.props.children === 'Cast your vote').length > 0)[0];
  await act(async () => button.props.onPress());
  expect(replace).toHaveBeenCalledWith('/screens/vote');
  expect(submit).not.toHaveBeenCalled();
});
