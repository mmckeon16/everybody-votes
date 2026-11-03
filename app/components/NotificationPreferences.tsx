import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform, View } from 'react-native';
import Constants from 'expo-constants';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Text } from '~/components/ui/text';

type PermissionState = 'loading' | 'available' | 'enabled' | 'denied' | 'unavailable';

export default function NotificationPreferences() {
  const [permission, setPermission] = useState<PermissionState>('loading');
  const [requesting, setRequesting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const mounted = useRef(false);
  const requestInFlight = useRef(false);
  const refreshVersion = useRef(0);
  const appId = Constants.expoConfig?.extra?.oneSignalAppId;
  const supported = Platform.OS !== 'web' && typeof appId === 'string' && appId.length > 0;

  const refreshPermission = useCallback(async () => {
    const version = ++refreshVersion.current;
    try {
      const granted = await OneSignal.Notifications.getPermissionAsync();
      const canRequest = granted ? false : await OneSignal.Notifications.canRequestPermission();
      if (mounted.current && version === refreshVersion.current) {
        setPermission(granted ? 'enabled' : canRequest ? 'available' : 'denied');
      }
    } catch {
      if (mounted.current && version === refreshVersion.current) setPermission('unavailable');
    }
  }, []);

  useEffect(() => {
    if (!supported) return;
    mounted.current = true;
    try {
      OneSignal.Debug.setLogLevel(__DEV__ ? LogLevel.Verbose : LogLevel.None);
      OneSignal.initialize(appId);
    } catch {
      setPermission('unavailable');
      return () => { mounted.current = false; };
    }
    const onPermissionChange = () => { void refreshPermission(); };
    OneSignal.Notifications.addEventListener('permissionChange', onPermissionChange);
    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') void refreshPermission();
    });
    void refreshPermission();
    return () => {
      mounted.current = false;
      ++refreshVersion.current;
      appState.remove();
      OneSignal.Notifications.removeEventListener('permissionChange', onPermissionChange);
    };
  }, [appId, supported, refreshPermission]);

  const enableNotifications = async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setRequesting(true);
    setActionError(null);
    try {
      // Permission may have changed since this card rendered. Never fall back to Settings.
      if (await OneSignal.Notifications.canRequestPermission()) {
        await OneSignal.Notifications.requestPermission(false);
      }
      await refreshPermission();
    } catch {
      if (mounted.current) setActionError('We could not open notification permissions. Please try again.');
    } finally {
      requestInFlight.current = false;
      if (mounted.current) setRequesting(false);
    }
  };

  const openSettings = async () => {
    setActionError(null);
    try {
      await Linking.openSettings();
    } catch {
      if (mounted.current) setActionError('Open your device Settings to change notification permissions.');
    }
  };

  if (!supported || permission === 'loading' || permission === 'enabled') return null;

  return (
    <Card className="w-full max-w-sm rounded-2xl">
      <CardHeader>
        <CardTitle>Catch the next question</CardTitle>
      </CardHeader>
      <CardContent className="gap-3">
        <Text className="text-muted-foreground">
          {permission === 'denied'
            ? 'Notifications are off. You can keep polling without them, or change this in your device Settings.'
            : permission === 'unavailable'
              ? 'Notification settings are unavailable right now. You can keep using Everybody Polls.'
              : 'Want a heads-up when a new poll opens? Notifications are optional.'}
        </Text>
        {actionError && <Text accessibilityRole="alert">{actionError}</Text>}
        {permission === 'available' && (
          <Button onPress={() => { void enableNotifications(); }} disabled={requesting}>
            <Text>{requesting ? 'Opening permissions…' : 'Enable notifications'}</Text>
          </Button>
        )}
        {permission === 'denied' && (
          <Button variant="outline" onPress={() => { void openSettings(); }}>
            <Text>Open device Settings</Text>
          </Button>
        )}
        {permission === 'unavailable' && (
          <Button variant="outline" onPress={() => { void refreshPermission(); }}>
            <Text>Check notification settings</Text>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
