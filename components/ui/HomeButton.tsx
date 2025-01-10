import * as React from 'react';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { Button } from './button';

const HomeButton = () => {
  const router = useRouter();
  const { colorScheme } = useNativewindColorScheme();

  const handleHomePress = () => {
    router.push('/');
  };
  return (
    <Button size="icon" variant="ghost" onPress={handleHomePress}>
      <FontAwesome
        name="home"
        size={18}
        color={colorScheme === 'dark' ? 'white' : 'black'}
      />
    </Button>
  );
};

export { HomeButton };
