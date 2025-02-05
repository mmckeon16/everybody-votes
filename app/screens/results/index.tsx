import React, { useState } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { useResults } from '../../hooks/useResults';
import { Text } from '~/components/ui/text';
import FilteredResultsCard from './components/FilteredResultsCard';
import LineChart from './components/LineChart';
import StateMap from './components/StateMap';

import { useLastActiveQuestion } from '~/app/hooks/useLastActiveQuestion';
import { addColorToResults, analyzeVoteData } from '../../lib/utils';

export default function Results() {
  const [filteredDemographics, setFilteredDemographics] = useState(null);
  const { data: lastQuestion } = useLastActiveQuestion();

  const { data: totalResults, isLoading, error } = useResults(lastQuestion?.id);
  console.log('Data from totalResults....');
  console.log(totalResults);
  const nullData = { question: null, totalVotes: null, results: null };
  const {
    data: {
      question,
      totalVotes,
      results,
      user_vote,
      user_prediction,
      stateResults,
    } = nullData,
  } = totalResults || {};

  let isPopulatedFilter = null;
  if (filteredDemographics) {
    isPopulatedFilter = Object.values(filteredDemographics).some(
      arr => arr.length > 0
    );
  }

  if (isLoading || !totalResults) {
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

  const coloredResults = addColorToResults(results);
  let myStats = null;
  if (coloredResults && user_vote && user_prediction) {
    myStats = analyzeVoteData(coloredResults, totalResults?.data);
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="flex-1 w-full bg-blueBg"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 items-center px-6 py-4 gap-4">
        {totalResults && (
          <LineChart
            question={question}
            totalVotes={totalVotes}
            results={coloredResults}
            user_vote={user_vote}
            user_prediction={user_prediction}
            myStats={myStats}
            filteredDemographics={filteredDemographics}
            setFilteredDemographics={setFilteredDemographics}
          />
        )}
        {filteredDemographics && isPopulatedFilter && (
          <FilteredResultsCard
            filteredDemographics={filteredDemographics}
            activeQuestion={lastQuestion}
            setFilteredDemographics={setFilteredDemographics}
            totalVotes={totalVotes}
          />
        )}
        <StateMap stateResults={stateResults} />
      </View>
    </ScrollView>
  );
}
