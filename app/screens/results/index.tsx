import React, { useState } from 'react';
import { View } from 'react-native';
import PieChart from './components/PieChart';
import { useResults } from '../../hooks/useResults';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card';
import { aggregateVotes } from '../../lib/utils';
import NumberFlipper from './components/NumberFlipper';
// import FilterDropDown from './components/FilterDropDown';
import FilterModal from './components/FilterModal';
import Ionicons from '@expo/vector-icons/Ionicons';
import Flower from './components/Flower';
import { useActiveQuestion } from '~/app/hooks/useActiveQuestion';

export default function Results() {
  const [filteredDemographics, setFilteredDemographics] = useState({});
  const { data: activeQuestion } = useActiveQuestion();

  const { data: totalResults, isLoading, error } = useResults(
    activeQuestion?.id,
    {}
  );
  console.log('Data from totalResults....');
  console.log(totalResults);

  const {
    data: filteredResults,
    isLoading: filteredIsLoading,
    error: filteredError,
  } = useResults(activeQuestion?.id, filteredDemographics);

  console.log('Data from filtered....', filteredDemographics);
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
          <CardDescription className="self-start ml-6">
            <FilterModal
              filteredDemographics={filteredDemographics}
              setFilteredDemographics={setFilteredDemographics}
            />
          </CardDescription>
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
            {/* <Flower color="blue" isBlooming={true} /> */}
          </View>
        </CardContent>
      </Card>
      {/* <Card className="max-w-3xl m-6">{filteredValues}</Card> */}
    </View>
  );
}
