import React, { useRef } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import LottieView from 'lottie-react-native';
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
const vote = require('../../../assets/lottie/vote.json');

export default function Celebrate() {
  const router = useRouter();
  const voteRef = useRef<LottieView>(null);

  return (
    <View className="flex-col items-center overflow-hidden p-8 h-full bg-blueBg">
      <Card className="w-full max-w-md p-2 rounded-2xl">
        <CardHeader>
          <CardTitle className="pb-2">
            Thanks for filling out your profile
          </CardTitle>
          <CardDescription>
            We'll use this info to make results more interesting!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-col gap-3">
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
              router.replace('/');
            }}
          >
            <Text>Go home</Text>
          </Button>
        </CardContent>
      </Card>

      <View className="pt-7 self-center flex-1">
        <LottieView
          ref={voteRef}
          source={vote}
          autoPlay={true}
          loop={false}
          style={{ width: '100%', height: '100%' }} // Explicit dimensions
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-full z-0 pointer-events-none"
          resizeMode="cover"
        />
      </View>
    </View>
  );
}
