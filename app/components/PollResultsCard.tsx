import React from 'react';
import { useRouter } from 'expo-router';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { SkeletonCard } from './SkeletonCard';
import useLastActiveQuestion from '../hooks/useLastActiveQuestion';
import { View } from 'react-native';

export const PollResultsCard = () => {
  const router = useRouter();
  const { data: lastQuestion, isLoading, error } = useLastActiveQuestion();
  const { user_vote, options } = lastQuestion || {};

  if (isLoading)
    return (
      <View className="flex flex-col gap-3 items-center w-full">
        <SkeletonCard />
      </View>
    );
  if (error) return <Text>Error: {error.message}</Text>;

  const question = lastQuestion;
  let userVotedText = null;
  if (question?.user_vote) {
    userVotedText =
      options[0]?.id === user_vote ? options[0]?.text : options[1]?.text;
  }

  return (
    <Card className="w-full max-w-sm p-2 rounded-2xl">
      <CardHeader className="items-center pb-3">
        <CardTitle className="pb-2 text-center">
          View previous poll results
        </CardTitle>
        <CardDescription>{question?.text}</CardDescription>
      </CardHeader>
      <CardFooter className="flex-col pb-4">
        <View className="items-center gap-3">
          {userVotedText && (
            <Text>
              You voted{' '}
              <Text className="text-lightBlue font-bold">{userVotedText}</Text>
            </Text>
          )}
          <Button
            variant="outline"
            className="shadow shadow-foreground/5"
            onPress={() => {
              router.push('/screens/results');
            }}
          >
            <Text>Results</Text>
          </Button>
        </View>
      </CardFooter>
    </Card>
  );
};

export default PollResultsCard;
