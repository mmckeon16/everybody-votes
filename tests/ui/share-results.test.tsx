import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Platform, Share } from 'react-native';
import ShareResultsButton from '../../app/screens/results/components/ShareResultsButton';
import WebShareResultsButton from '../../app/screens/results/components/ShareResultsButton.web';

jest.mock('~/components/ui/button', () => ({ Button: require('react-native').Pressable }), { virtual: true });
jest.mock('~/components/ui/text', () => ({ Text: require('react-native').Text }), { virtual: true });

const question = { id: 'bcd78750-e194-4bbf-a1bb-6c42dcfe60ac', text: 'Beach or mountains?' };
const url = `https://www.everybodypolls.com/shared/${question.id}`;
let tree: ReactTestRenderer;
let share: jest.SpyInstance;

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  share = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  if (tree) await act(async () => tree.unmount());
  jest.restoreAllMocks();
});

async function mount() {
  await act(async () => { tree = create(<ShareResultsButton question={question} />); });
}
function button() {
  return tree.root.findAll(node => typeof node.props.onPress === 'function')[0];
}
function text() { return JSON.stringify(tree.toJSON()); }

test('explicit iOS action shares the displayed question and public URL without identity data', async () => {
  await mount();
  expect(share).not.toHaveBeenCalled();
  await act(async () => { await button().props.onPress(); });
  expect(share).toHaveBeenCalledTimes(1);
  expect(share).toHaveBeenCalledWith({ title: 'Everybody Polls results', message: question.text, url },
    expect.objectContaining({ subject: 'Everybody Polls results' }));
  expect(text()).not.toContain('Could not open sharing');
});

test('dismissing the chooser is quiet and permits another attempt', async () => {
  share.mockResolvedValue({ action: Share.dismissedAction });
  await mount();
  await act(async () => { await button().props.onPress(); });
  expect(button().props.disabled).toBe(false);
  expect(text()).not.toContain('Could not open sharing');
  await act(async () => { await button().props.onPress(); });
  expect(share).toHaveBeenCalledTimes(2);
});

test('provider failure shows a safe retry message and never exposes error details', async () => {
  share.mockRejectedValueOnce(new Error('private diagnostic must not appear'));
  await mount();
  await act(async () => { await button().props.onPress(); });
  expect(text()).toContain('Could not open sharing. Please try again.');
  expect(text()).not.toContain('private diagnostic');
  expect(button().props.disabled).toBe(false);
  await act(async () => { await button().props.onPress(); });
  expect(text()).not.toContain('Could not open sharing');
});

test('repeated presses cannot open overlapping native choosers', async () => {
  let finish!: (result: { action: string }) => void;
  share.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  await mount();
  let pending!: Promise<void>;
  await act(async () => {
    pending = button().props.onPress();
    await button().props.onPress();
  });
  expect(share).toHaveBeenCalledTimes(1);
  expect(button().props.disabled).toBe(true);
  await act(async () => { finish({ action: Share.dismissedAction }); await pending; });
  expect(button().props.disabled).toBe(false);
});

test('Android includes the public URL in the shared message', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  await mount();
  await act(async () => { await button().props.onPress(); });
  expect(share).toHaveBeenCalledWith({ title: 'Everybody Polls results', message: `${question.text}\n${url}` }, expect.any(Object));
});

test('web renders no unsupported native share button', async () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  await mount();
  expect(tree.toJSON()).toBeNull();
  await act(async () => { tree.update(<WebShareResultsButton question={question} />); });
  expect(tree.toJSON()).toBeNull();
  expect(share).not.toHaveBeenCalled();
});
