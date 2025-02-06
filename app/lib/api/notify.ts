import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../supabase';

export async function registerForPushNotifications(userId: string) {
  let token;

  if (Device.isDevice) {
    const {
      status: existingStatus,
    } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Get the token using your Expo project ID
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
  }

  return token;
}

// Store the token in Supabase, even for non-authenticated users
export async function storeDeviceToken(token) {
  try {
    const { data, error } = await supabase.from('device_tokens').upsert(
      {
        token: token.data,
        device_id: Device.deviceName || 'unknown',
        last_active: new Date(),
      },
      { onConflict: 'token' }
    );

    if (error) throw error;
  } catch (error) {
    console.error('Error storing push token:', error);
  }
}

export async function unregisterPushNotifications(userId: string) {
  try {
    await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error unregistering push notifications:', error);
    // throw error;
  }
}
