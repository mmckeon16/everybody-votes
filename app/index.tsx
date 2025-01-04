import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Text } from '~/components/ui/text';
import { SkeletonCard } from './components/SkeletonCard';
import { useRouter } from 'expo-router';
import {
  getTimeUntilExpiration,
  getTimeRemainingPercentage,
} from './lib/utils';
import { useActiveQuestion } from './hooks/useActiveQuestion';

export default function Screen() {
  const [appIsReady, setAppIsReady] = useState(false);
  const router = useRouter();
  const { data: activeQuestion, isLoading } = useActiveQuestion();

  useEffect(() => {
    async function prepare() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!isLoading) {
        setAppIsReady(true);
        // SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [isLoading]);

  const { user_vote, options } = activeQuestion || {};

  let userVotedText = null;
  if (user_vote) {
    userVotedText =
      options[0]?.id === user_vote ? options[0]?.text : options[1]?.text;
  }

  const hasEndDatePassed = new Date() > new Date(activeQuestion?.end_date);

  return (
    <View className="flex-1 items-center gap-5 p-6 bg-blueBg">
      {!appIsReady ? (
        <SkeletonCard />
      ) : (
        <Card className="w-full max-w-sm p-2 rounded-2xl">
          <CardHeader className="items-center">
            <CardTitle className="pb-2 text-center">
              {activeQuestion?.text}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col gap-3 pb-4">
            {hasEndDatePassed ? (
              <View className="flex flex-col gap-2">
                <Text className="text-center text-lg font-semibold text-lightBlue">
                  This poll has ended
                </Text>
                <Text className="text-center text-slate-600	">
                  Come back soon to vote on the next question and view the
                  results
                </Text>
              </View>
            ) : (
              <View>
                <Progress
                  value={getTimeRemainingPercentage(
                    activeQuestion?.start_date ?? '',
                    activeQuestion?.end_date ?? ''
                  )}
                  className="h-2"
                  indicatorClassName="bg-lightBlue"
                />
                <View className="flex-row items-center overflow-hidden">
                  <Text className="text-sm font-bold text-lightBlue">
                    {getTimeUntilExpiration(activeQuestion?.end_date ?? '')}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {' '}
                    until this poll closes
                  </Text>
                </View>
                <View />
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
            )}
          </CardFooter>
        </Card>
      )}
      <Card className="w-full max-w-sm p-2 rounded-2xl">
        <CardHeader className="items-center">
          <CardTitle className="pb-2 text-center">
            View previous poll results
          </CardTitle>
          <CardDescription>TODO add question here</CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-3 pb-4">
          <Button
            variant="outline"
            className="shadow shadow-foreground/5"
            onPress={() => {
              router.push('/screens/results');
            }}
          >
            <Text>Results</Text>
          </Button>
        </CardFooter>
      </Card>
      <Button
        onPress={() => {
          throw new Error('Hello, again, Sentry!');
        }}
      >
        <Text>Throw error</Text>
      </Button>
    </View>
  );
}
