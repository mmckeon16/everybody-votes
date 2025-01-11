import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { Button } from '~/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Text } from '~/components/ui/text';
import {
  getTimeUntilExpiration,
  getTimeRemainingPercentage,
} from '../lib/utils';
import { useActiveQuestion } from '../hooks/useActiveQuestion';
import ErrorVoteCard from './ErrorVoteCard';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options (optional)
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function Screen() {
  const router = useRouter();
  const { colorScheme } = useNativewindColorScheme();
  const { data: activeQuestion, error, isError } = useActiveQuestion();
  const { user_vote, options } = activeQuestion || {};

  let userVotedText = null;
  if (user_vote) {
    userVotedText =
      options[0]?.id === user_vote ? options[0]?.text : options[1]?.text;
  }

  const hasEndDatePassed = new Date() > new Date(activeQuestion?.end_date);

  if (isError) {
    return (
      <View className="flex justify-center items-center w-full">
        <ErrorVoteCard />
      </View>
    );
  }
  const percentage = getTimeRemainingPercentage(
    activeQuestion?.start_date ?? '',
    activeQuestion?.end_date ?? ''
  );

  return (
    <Card className="w-full max-w-sm p-2 rounded-2xl">
      <CardHeader className="items-center pb-3">
        <CardTitle className="text-center">{activeQuestion?.text}</CardTitle>
      </CardHeader>
      <CardFooter className="flex-col gap-3 pb-4 pt-0">
        {hasEndDatePassed ? (
          <View className="flex flex-col gap-2">
            <Text className="text-center text-lg font-semibold text-lightBlue">
              This poll has ended
            </Text>
            <Text className="text-center text-slate-600">
              Come back soon to vote on the next question and view the results
            </Text>
          </View>
        ) : (
          <View className="flex flex-col gap-3 w-full">
            <Progress
              value={percentage}
              className="h-2"
              indicatorClassName="bg-blueLightPinkDark"
            />
            <View className="flex-row items-center justify-center overflow-hidden">
              <Text className="text-sm font-bold text-blueLightPinkDark">
                {getTimeUntilExpiration(activeQuestion?.end_date ?? '')}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {' '}
                until this poll closes
              </Text>
            </View>
            <View className="items-center">
              {userVotedText ? (
                <Text>
                  You voted{' '}
                  <Text className="text-lightBlue font-bold">
                    {userVotedText}
                  </Text>
                </Text>
              ) : (
                <Button
                  variant="outline"
                  className="shadow shadow-foreground/5"
                  onPress={() => {
                    router.push('/screens/vote');
                  }}
                >
                  <Text>Vote</Text>
                </Button>
              )}
            </View>
          </View>
        )}
      </CardFooter>
    </Card>
  );
}
