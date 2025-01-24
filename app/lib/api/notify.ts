import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../supabase';

// Configure how notifications should appear
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(userId: string) {
  try {
    // Request permission
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted for push notifications');
    }

    // Get the token
    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // First, delete any existing tokens for this user
    await supabase.from('push_tokens').delete().eq('user_id', userId);

    // Then insert the new token
    const { error } = await supabase.from('push_tokens').insert([
      {
        user_id: userId,
        token: token,
      },
    ]);

    if (error) throw error;

    // Platform-specific setup
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    // throw error;
  }
}

export async function unregisterPushNotifications(userId: string) {
  try {
    await supabase.from('push_tokens').delete().eq('user_id', userId);
  } catch (error) {
    console.error('Error unregistering push notifications:', error);
    // throw error;
  }
}
