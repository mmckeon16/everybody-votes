import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Text } from '~/components/ui/text';
import { SkeletonCard } from './components/SkeletonCard';
import { useActiveQuestion } from './hooks/useActiveQuestion';
import PollResultsCard from './components/PollResultsCard';
import VoteCard from './components/VoteCard';
import ErrorVoteCard from './components/ErrorVoteCard';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options (optional)
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function Screen() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { isLoading, error } = useActiveQuestion();

  useEffect(() => {
    async function prepare() {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!isLoading) {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [isLoading]);

  if (error) {
    return (
      <View className="flex-1 p-6 bg-blueBg flex flex-col gap-3 items-center w-full">
        <ErrorVoteCard />
        <PollResultsCard />
      </View>
    );
  }

  return (
    <View className="flex-1 p-6 bg-blueBg">
      {!appIsReady ? (
        <View className="flex flex-col gap-3 items-center w-full">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <View className="flex-1 items-center gap-5 bg-blueBg">
          <VoteCard />
          <PollResultsCard />
        </View>
      )}
    </View>
  );
}
