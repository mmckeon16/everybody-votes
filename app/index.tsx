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
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options (optional)
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function Screen() {
  const [appIsReady, setAppIsReady] = useState(false);
  const router = useRouter();
  const { data: activeQuestion, isLoading } = useActiveQuestion();

  useEffect(() => {
    async function prepare() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!isLoading) {
        setAppIsReady(true);
        SplashScreen.hideAsync();
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

  console.log(userVotedText);

  if (!appIsReady) {
    return null;
  } else {
    return (
      <View className="flex-1 items-center gap-5 p-6">
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <Card className="w-full max-w-sm p-2 rounded-2xl">
            <CardHeader className="items-center">
              <CardTitle className="pb-2 text-center">
                {activeQuestion?.text}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col gap-3 pb-4">
              <Progress
                value={getTimeRemainingPercentage(
                  activeQuestion?.start_date ?? '',
                  activeQuestion?.end_date ?? ''
                )}
                className="h-2"
                indicatorClassName="bg-sky-600"
              />
              <View className="flex-row items-center overflow-hidden">
                <Text className="text-sm font-bold text-sky-600">
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
                  <Text className="text-sky-600">{userVotedText}</Text>
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
          variant="outline"
          className="shadow shadow-foreground/5"
          onPress={() => {
            router.push('/auth/complete-profile');
          }}
        >
          <Text>signup flow</Text>
        </Button>
      </View>
    );
  }
}
