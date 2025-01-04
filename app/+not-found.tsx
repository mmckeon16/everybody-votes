import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="m-3">
        <Button
          onPress={() => {
            router.push('/');
          }}
        >
          <Text>Go to home screen!</Text>
        </Button>
      </View>
    </>
  );
}
