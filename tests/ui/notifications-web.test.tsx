import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import NotificationPreferences from '../../app/components/NotificationPreferences.web';

jest.mock('react-native-onesignal', () => { throw new Error('Native SDK must not load in the web component'); });

test('web renders without importing the native OneSignal TurboModule', async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  let tree: ReactTestRenderer;
  await act(async () => { tree = create(<NotificationPreferences />); });
  expect(tree!.toJSON()).toBeNull();
  await act(async () => tree!.unmount());
});
