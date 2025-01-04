import React, { useEffect, useState } from 'react';
import { Button, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { SkeletonCard } from './components/SkeletonCard';
import { useActiveQuestion } from './hooks/useActiveQuestion';
import PollResultsCard from './components/PollResultsCard';
import VoteCard from './components/VoteCard';
import ErrorVoteCard from './components/ErrorVoteCard';

export default function Screen() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { isLoading, error } = useActiveQuestion();

  useEffect(() => {
    async function prepare() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!isLoading) {
        setAppIsReady(true);
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
