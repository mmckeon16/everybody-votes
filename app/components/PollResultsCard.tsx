import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardHeader, CardTitle, CardFooter } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import useLastActiveQuestion from '../hooks/useLastActiveQuestion';
import { changeResultsForChart } from '../lib/utils';
import { useResults } from '../hooks/useResults';
import PieChart from 'react-native-pie-chart';
import GradientBadge from '~/components/ui/GradientBadge';
import { SkeletonCard } from './SkeletonCard';

export const PollResultsCard = () => {
  const router = useRouter();
  const { data: lastQuestion, error: QuestionError } = useLastActiveQuestion();
  const { user_vote, options } = lastQuestion || {};

  const { data: totalResults, isLoading, error } = useResults(lastQuestion?.id);
  const nullData = { question: null, totalVotes: null, results: null };
  const { data: { results } = nullData } = totalResults || {};

  const alteredResults = changeResultsForChart(results);

  if (isLoading || !alteredResults) {
    return (
      <View className="flex flex-col gap-3 items-center w-full">
        <SkeletonCard />
      </View>
    );
  }

  if (error || QuestionError) return <Text>Error: {error?.message}</Text>;

  const question = lastQuestion;
  let userVotedText = null;
  if (question?.user_vote) {
    userVotedText =
      options[0]?.id === user_vote ? options[0]?.text : options[1]?.text;
  }

  // Calculate dynamic size based on container width
  const chartSize = 200; // Default size

  return (
    <Card className="w-full max-w-sm p-2 rounded-2xl">
      <CardHeader className="pb-1 pt-3 flex gap-3">
        <GradientBadge
          firstColor="#0879C4"
          secondColor="#2563EB"
          text="PREVIOUS RESULTS"
        />
        <CardTitle>{question?.text}</CardTitle>
      </CardHeader>

      <View className="px-4">
        <View className="w-full flex items-center justify-center py-4">
          <View style={{ width: chartSize, height: chartSize }}>
            <PieChart
              widthAndHeight={chartSize}
              series={alteredResults}
              sliceColor={['#2563EB', '#0879C4']}
              cover={0.45}
            />
          </View>
        </View>
      </View>

      <CardFooter className="flex-col pb-4">
        <View className="items-center gap-5 w-full">
          {userVotedText && (
            <Text>
              You voted <GradientBadge text={userVotedText} />
            </Text>
          )}
          <Button
            className="shadow w-full bg-midnight"
            onPress={() => router.push('/screens/results')}
          >
            <Text className="text-white">Explore</Text>
          </Button>
        </View>
      </CardFooter>
    </Card>
  );
};

export default PollResultsCard;
