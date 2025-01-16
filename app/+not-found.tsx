import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { View } from 'react-native';

export default function NotFoundScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex items-center justify-center h-full bg-gray-50">
      {isLoading ? (
        <ActivityIndicator size="large" className="text-blue-500" />
      ) : (
        <View className="flex items-center space-y-4">
          <Text className="text-6xl font-bold text-gray-800">404</Text>
          <Text className="text-xl text-gray-600">Page Not Found</Text>
          <Text className="text-gray-500 text-center px-4">
            Sorry, we couldn't find the page you're looking for.
          </Text>
        </View>
      )}
    </View>
  );
}
