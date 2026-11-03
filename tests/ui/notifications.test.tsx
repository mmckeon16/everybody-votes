import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AppState, Linking, Platform } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import NotificationPreferences from '../../app/components/NotificationPreferences';

jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { extra: { oneSignalAppId: 'test-app-id' } } } }));
jest.mock('react-native-onesignal', () => ({
  LogLevel: { Verbose: 6, None: 0 },
  OneSignal: {
    Debug: { setLogLevel: jest.fn() },
    initialize: jest.fn(),
    Notifications: {
      getPermissionAsync: jest.fn(), canRequestPermission: jest.fn(), requestPermission: jest.fn(),
      addEventListener: jest.fn(), removeEventListener: jest.fn(),
    },
  },
}));
jest.mock('~/components/ui/button', () => ({ Button: require('react-native').Pressable }), { virtual: true });
jest.mock('~/components/ui/text', () => ({ Text: require('react-native').Text }), { virtual: true });
jest.mock('~/components/ui/card', () => {
  const View = require('react-native').View;
  return { Card: View, CardContent: View, CardHeader: View, CardTitle: require('react-native').Text };
}, { virtual: true });

const notifications = jest.mocked(OneSignal.Notifications);
let tree: ReactTestRenderer;
let removeAppState: jest.Mock;
let openSettings: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.replaceProperty(Platform, 'OS', 'ios');
  notifications.getPermissionAsync.mockResolvedValue(false);
  notifications.canRequestPermission.mockResolvedValue(true);
  notifications.requestPermission.mockResolvedValue(false);
  removeAppState = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: removeAppState });
  openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  if (tree) await act(async () => tree.unmount());
  jest.restoreAllMocks();
});

async function mount() {
  await act(async () => { tree = create(<NotificationPreferences />); });
}

function button(label: string) {
  const match = tree.root.findAll(node =>
    typeof node.props.onPress === 'function' &&
    node.findAll(text => text.props.children === label).length > 0)[0];
  if (!match) throw new Error(`Missing button: ${label}`);
  return match;
}

test('mount checks status without requesting permission or opening Settings', async () => {
  await mount();
  expect(OneSignal.initialize).toHaveBeenCalledWith('test-app-id');
  expect(notifications.getPermissionAsync).toHaveBeenCalled();
  expect(notifications.requestPermission).not.toHaveBeenCalled();
  expect(openSettings).not.toHaveBeenCalled();
  expect(button('Enable notifications')).toBeDefined();
});

test('permission is requested only after opt-in and never falls back to Settings', async () => {
  await mount();
  await act(async () => { await button('Enable notifications').props.onPress(); });
  expect(notifications.requestPermission).toHaveBeenCalledTimes(1);
  expect(notifications.requestPermission).toHaveBeenCalledWith(false);
  expect(openSettings).not.toHaveBeenCalled();
});

test('denial is respected on mount; Settings requires its own explicit action', async () => {
  notifications.canRequestPermission.mockResolvedValue(false);
  await mount();
  expect(notifications.requestPermission).not.toHaveBeenCalled();
  expect(openSettings).not.toHaveBeenCalled();
  await act(async () => { await button('Open device Settings').props.onPress(); });
  expect(openSettings).toHaveBeenCalledTimes(1);
  expect(notifications.requestPermission).not.toHaveBeenCalled();
});

test('granted permission hides the opt-in and listeners are removed on unmount', async () => {
  notifications.getPermissionAsync.mockResolvedValue(true);
  await mount();
  expect(tree.toJSON()).toBeNull();
  await act(async () => tree.unmount());
  expect(removeAppState).toHaveBeenCalledTimes(1);
  expect(notifications.removeEventListener).toHaveBeenCalledWith('permissionChange', expect.any(Function));
});

test('web does not initialize or prompt the native SDK', async () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  await mount();
  expect(tree.toJSON()).toBeNull();
  expect(OneSignal.initialize).not.toHaveBeenCalled();
  expect(notifications.getPermissionAsync).not.toHaveBeenCalled();
  expect(notifications.requestPermission).not.toHaveBeenCalled();
});
