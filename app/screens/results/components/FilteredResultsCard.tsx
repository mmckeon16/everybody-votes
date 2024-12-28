import React, { useState } from 'react';
import { View } from 'react-native';
import PieChart from './PieChart';
import { useResults } from '../../../hooks/useResults';
import { Text } from '~/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { aggregateVotes } from '../../../lib/utils';
import NumberFlipper from './NumberFlipper';

interface FilterResultsProps {
  filteredDemographics: object;
  activeQuestion: object;
}

const FilterResultsCard: React.FC<FilterResultsProps> = ({
  filteredDemographics,
  activeQuestion,
}) => {
  const {
    data: filteredResults,
    isLoading: filteredIsLoading,
    error: filteredError,
  } = useResults(activeQuestion?.id, filteredDemographics);

  console.log('Data from filtered....', filteredResults);
  console.log(filteredResults);

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
      <Card className="max-w-3xl m-6">
        <CardHeader className="items-center">
          <CardTitle className="pb-2 text-center">
            {aggregateData?.questionText}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex items-center flex-1">
            <PieChart data={aggregateData?.options} size={200} strokeWidth={25}>
              <View className="flex justify-center">
                <Text>
                  <NumberFlipper targetNumber={100000} /> votes
                </Text>
              </View>
            </PieChart>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default FilterResultsCard;
