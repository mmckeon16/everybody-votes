import React, { useEffect, useState } from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SkeletonCard } from './components/SkeletonCard';
import { useActiveQuestion } from './hooks/useActiveQuestion';
import PollResultsCard from './components/PollResultsCard';
import VoteCard from './components/VoteCard';
import ErrorVoteCard from './components/ErrorVoteCard';
import { Button } from '~/components/ui/button';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import Constants from 'expo-constants';

export default function Screen() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { isLoading, isError, error } = useActiveQuestion();
  const router = useRouter();
  if (Platform.OS !== 'web') {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);

    // Also need enable notifications to complete OneSignal setup
    OneSignal?.Notifications.requestPermission(true);
  }
  const handleHomePress = () => {
    router.push('/auth/signup');
  };
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
    <ScrollView
      className="flex-1 p-6 bg-blueBg"
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      {!appIsReady ? (
        <View className="flex flex-col gap-3 items-center w-full">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <View className="flex-1 items-center gap-5 pb-10 bg-blueBg">
          <VoteCard />
          <PollResultsCard />
          {/* <Button size="icon" onPress={handleHomePress}>
            <FontAwesome name="home" size={18} color={'white'} />
          </Button> */}
        </View>
      )}
    </ScrollView>
  );
}
