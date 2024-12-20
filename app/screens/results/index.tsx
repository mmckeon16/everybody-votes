import React from 'react';
import { View } from 'react-native';
import PieChart from './components/PieChart';
import { useResults } from '../../hooks/useResults';
import { Text } from '~/components/ui/text';
import { aggregateVotes } from '../../lib/utils';
import NumberFlipper from './components/NumberFlipper';
import Flower from './components/Flower';

export default function Results() {
  const { data: results, isLoading, error } = useResults(
    '123e4567-e89b-12d3-a456-426614174000'
  );
  // console.log(results);

  //options and percent for each

  // if (isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  // if (error) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ThemedText type="default">Failed to load results</ThemedText>
  //     </View>
  //   );
  // }

  /*
  id,
  created_at,
  options (
    id,
    text,
    question_id,
    questions (
      id,
      text

      */

  const rawData = [
    {
      id: 'UUID HERE',
      created_at: 'new Date',
      options: {
        id: 'option id',
        text: 'Yes',
        question_id: 'your-question-id',
        questions: {
          id: 'your-question-id',
          text: 'Should US Presidents have term limits',
        },
      },
    },
    {
      id: 'UUID HERE',
      created_at: 'new Date',
      options: {
        id: 'option id',
        text: 'Yes',
        question_id: 'your-question-id',
        questions: {
          id: 'your-question-id',
          text: 'Should US Presidents have term limits',
        },
      },
    },
    {
      id: 'UUID HERE',
      created_at: 'new Date',
      options: {
        id: 'option id',
        text: 'Yes',
        question_id: 'your-question-id',
        questions: {
          id: 'your-question-id',
          text: 'Should US Presidents have term limits',
        },
      },
    },
    {
      id: 'UUID HERE',
      created_at: 'new Date',
      options: {
        id: 'option id 2',
        text: 'No',
        question_id: 'your-question-id',
        questions: {
          id: 'your-question-id',
          text: 'Should US Presidents have term limits',
        },
      },
    },
  ];
  const aggregateData = aggregateVotes(rawData);

  // TODO add in prediction
  return (
    <View className="flex-column items-center overflow-hidden flex-1">
      <Text className="text-2xl text-inherit p-2.5">
        {aggregateData?.questionText}
      </Text>
      <View className="flex items-center flex-1 p-6">
        <PieChart data={aggregateData?.options} size={200} strokeWidth={25}>
          <View className="flex justify-center">
            <Text>
              <NumberFlipper targetNumber={100000} /> votes
            </Text>
          </View>
        </PieChart>
        {/* <Flower /> */}
        <Flower color="blue" isBlooming={true} />
      </View>
    </View>
  );
}
