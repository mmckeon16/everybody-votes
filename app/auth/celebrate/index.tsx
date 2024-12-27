import React, { useRef } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import LottieView from 'lottie-react-native';

const confetti = require('../../../assets/lottie/celebrate.json');

export default function Celebrate() {
  const router = useRouter();
  const confettiRef = useRef<LottieView>(null);

  return (
    <View className="flex-col items-center justify-center overflow-hidden flex-1 p-8 gap-10 relative mt-2">
      <View className="z-10 flex flex-col gap-5">
        <Text className="text-3xl text-center">
          Thanks for filling out your profile
        </Text>
        <Text className="text-lg text-center">
          We'll use this info to make results more interesting!
        </Text>
        <Button
          variant="outline"
          className="shadow shadow-foreground/5"
          onPress={() => {
            router.replace('/screens/vote');
          }}
        >
          <Text>Vote now</Text>
        </Button>
        <Button
          variant="outline"
          className="shadow shadow-foreground/5"
          onPress={() => {
            router.replace('/(app');
          }}
        >
          <Text>Go home</Text>
        </Button>
      </View>

      <LottieView
        ref={confettiRef}
        source={confetti}
        autoPlay={true}
        loop={false}
        style={{ width: 200, height: 200 }} // Explicit dimensions
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-full z-0 pointer-events-none"
        resizeMode="cover"
      />
    </View>
  );
}
