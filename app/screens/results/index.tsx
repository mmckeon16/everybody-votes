import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import PieChart from './components/PieChart';
import { useResults } from '../../hooks/useResults';
import { Text } from '~/components/ui/text';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card';
import NumberFlipper from './components/NumberFlipper';
import FilterModal from './components/FilterModal';
import FilteredResultsCard from './components/FilteredResultsCard';
import { useActiveQuestion } from '~/app/hooks/useActiveQuestion';
import { addColorToResults } from '../../lib/utils';

export default function Results() {
  const [filteredDemographics, setFilteredDemographics] = useState(null);
  const { data: activeQuestion } = useActiveQuestion();

  const { data: totalResults, isLoading, error } = useResults(
    activeQuestion?.id,
    {}
  );
  console.log('Data from totalResults....');
  console.log(totalResults);
  const nullData = { question: null, totalVotes: null, results: null };
  const { data: { question, totalVotes, results } = nullData } =
    totalResults || {};

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex justify-center items-center">
        <Text>Failed to load results</Text>
      </View>
    );
  }
  return (
    <View className="flex-column items-center overflow-hidden flex-1">
      <Card className="max-w-3xl m-6">
        <CardHeader className="items-center">
          <CardTitle className="pb-2 text-center">{question?.text}</CardTitle>
          <CardDescription className="self-start ml-6">
            <FilterModal
              filteredDemographics={filteredDemographics}
              setFilteredDemographics={setFilteredDemographics}
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results && results.length === 2 && (
            <View className="flex items-center flex-1">
              <PieChart
                data={addColorToResults(results)}
                size={200}
                strokeWidth={25}
              >
                <View className="flex justify-center">
                  <Text>
                    <NumberFlipper targetNumber={totalVotes} /> votes
                  </Text>
                </View>
              </PieChart>
            </View>
          )}
        </CardContent>
      </Card>
      {console.log('filtered', filteredDemographics)}
      {filteredDemographics && (
        <FilteredResultsCard
          filteredDemographics={filteredDemographics}
          activeQuestion={activeQuestion}
        />
      )}
    </View>
  );
}
