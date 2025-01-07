import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SkeletonCard } from './components/SkeletonCard';
import { useActiveQuestion } from './hooks/useActiveQuestion';
import PollResultsCard from './components/PollResultsCard';
import VoteCard from './components/VoteCard';
import ErrorVoteCard from './components/ErrorVoteCard';

export default function Screen() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { isLoading, isError, error } = useActiveQuestion();

  useEffect(() => {
    async function prepare() {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!isLoading) {
        setAppIsReady(true);
      }
    }
    prepare();
  }, [isLoading]);

  if (isError) {
    console.log('error', error);
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
