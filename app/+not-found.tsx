import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import * as Linking from 'expo-linking';
import { useState, useEffect } from 'react';

export default function NotFoundScreen() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<{
    initialUrl: string | null;
    currentUrl: string | null;
    lastError: string | null;
    timestamp: string;
  }>({
    initialUrl: null,
    currentUrl: null,
    lastError: null,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    // Get initial URL with error handling
    Linking.getInitialURL()
      .then((url) => {
        setDebugInfo((prev) => ({
          ...prev,
          initialUrl: url,
        }));
      })
      .catch((error) => {
        setDebugInfo((prev) => ({
          ...prev,
          lastError: error.message || 'Error getting initial URL',
        }));
      });

    // Listen for URL changes with error handling
    const subscription = Linking.addEventListener('url', ({ url }) => {
      try {
        console.log('URL Event received:', url);
        setDebugInfo((prev) => ({
          ...prev,
          currentUrl: url,
          timestamp: new Date().toISOString(),
        }));
      } catch (error: any) {
        setDebugInfo((prev) => ({
          ...prev,
          lastError: error.message || 'Error handling URL event',
        }));
      }
    });

    // Try to get the current URL
    try {
      const url = Linking.createURL('');
      setDebugInfo((prev) => ({
        ...prev,
        lastError: `Current app URL scheme: ${url}`,
      }));
    } catch (error: any) {
      setDebugInfo((prev) => ({
        ...prev,
        lastError: error.message || 'Error getting URL scheme',
      }));
    }

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Debug Info' }} />
      <ScrollView className="m-3">
        <View className="bg-red-100 p-4 rounded-lg mb-4">
          <Text className="text-red-800 font-bold mb-2">
            Debug Information:
          </Text>
          <Text className="text-red-800">Time: {debugInfo.timestamp}</Text>
          <Text className="text-red-800">
            Initial URL: {debugInfo.initialUrl || 'None'}
          </Text>
          <Text className="text-red-800">
            Current URL: {debugInfo.currentUrl || 'None'}
          </Text>
          <Text className="text-red-800">
            Last Error: {debugInfo.lastError || 'None'}
          </Text>
        </View>

        <Button
          onPress={() => {
            router.push('/');
          }}
        >
          <Text>Go to home screen!</Text>
        </Button>

        <Button
          className="mt-2"
          onPress={() => {
            setDebugInfo((prev) => ({
              ...prev,
              timestamp: new Date().toISOString(),
            }));
          }}
        >
          <Text>Refresh Debug Info</Text>
        </Button>
      </ScrollView>
    </>
  );
}
