import React, { useRef } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { getTimeUntilExpiration } from '../../lib/utils';
import LottieView from 'lottie-react-native';
import { useActiveQuestion } from '../../hooks/useActiveQuestion';

export default function Thanks() {
  const router = useRouter();

  const { data: activeQuestion, isLoading } = useActiveQuestion();
  const confettiRef = useRef<LottieView>(null);

  // confettiRef.current?.play(0);

  return (
    <View className="flex-column items-center justify-center overflow-hidden flex-1 p-8 gap-10 relative">
      <View className="z-10">
        <Text className="text-6xl text-center">Thanks for participating!</Text>
        <Text className="text-lg text-center mt-10">
          Come back in {getTimeUntilExpiration(activeQuestion?.endDate)} to see
          the results
        </Text>
        <Button
          variant="outline"
          className="shadow shadow-foreground/5"
          onPress={() => {
            router.push('/');
          }}
        >
          <Text>Home</Text>
        </Button>
      </View>

      <LottieView
        ref={confettiRef}
        source={require('../../../assets/lottie/celebrate.json')}
        autoPlay={true}
        loop={false}
        style={{ width: 200, height: 200 }} // Explicit dimensions
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-full z-0 pointer-events-none"
        resizeMode="cover"
      />
    </View>
  );
}
