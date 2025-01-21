import React, { useLayoutEffect, useState } from 'react';
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
// import PieChart from '../screens/results/components/PieChart';
import NumberFlipper from '../screens/results/components/NumberFlipper';
import { changeResultsForChart } from '../lib/utils';
import { useResults } from '../hooks/useResults';
import GradientBadge from '~/components/ui/GradientBadge';
import { PieChart, Pie, Legend, Cell } from 'recharts';

export const PollResultsCard = () => {
  const router = useRouter();
  const [chartMounted, setChartMounted] = useState(false);
  const { data: lastQuestion, error: QuestionError } = useLastActiveQuestion();
  const { user_vote, options } = lastQuestion || {};

  const { data: totalResults, isLoading, error } = useResults(lastQuestion?.id);
  const nullData = { question: null, totalVotes: null, results: null };
  const { data: { totalVotes, results } = nullData } = totalResults || {};

  const alteredResults = changeResultsForChart(results);

  useLayoutEffect(() => {
    setChartMounted(true);
  }, []);

  if (isLoading || !totalResults)
    return (
      <View className="flex flex-col gap-3 items-center w-full">
        <SkeletonCard />
      </View>
    );
  if (error || QuestionError) return <Text>Error: {error.message}</Text>;

  const question = lastQuestion;
  let userVotedText = null;
  if (question?.user_vote) {
    userVotedText =
      options[0]?.id === user_vote ? options[0]?.text : options[1]?.text;
  }

  console.log('altereddata: ', alteredResults);

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
      <CardDescription className="pb-3">
        <View className="w-full flex items-center justify-center">
          <PieChart width={300} height={300}>
            <Pie
              dataKey="value"
              data={alteredResults}
              cx={150}
              cy={150}
              innerRadius={40}
              outerRadius={80}
              fill="#82ca9d"
              label
            >
              {alteredResults?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </View>
      </CardDescription>
      <CardFooter className="flex-col pb-4">
        <View className="items-center gap-5 w-full">
          {userVotedText && (
            <Text>
              You voted <GradientBadge text={userVotedText} />
            </Text>
          )}
          <Button
            className="shadow shadow-foreground/5 w-full bg-midnight"
            onPress={() => {
              router.push('/screens/results');
            }}
          >
            <Text className="text-white">Explore</Text>
          </Button>
        </View>
      </CardFooter>
    </Card>
  );
};

export default PollResultsCard;
