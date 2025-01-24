import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export function setupNotifications() {
  // Configuration for how notifications should be handled
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Set up notification categories/actions if needed
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

// Set up notification listeners
export function useNotificationListeners() {
  useEffect(() => {
    // Handle notifications when app is in foreground
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Received notification in foreground:', notification);
        // Handle the notification here
      });

    // Handle notification responses (when user taps notification)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log('Notification response:', response);

        // Handle the user's interaction with the notification
        if (data.questionId) {
          // Navigate to the question
          router.push(`/`);
        }
      });

    // Cleanup
    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);
}
