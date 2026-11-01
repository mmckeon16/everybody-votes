import React, { useState } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { useResults } from '../../hooks/useResults';
import { Text } from '~/components/ui/text';
import FilteredResultsCard from './components/FilteredResultsCard';
import LineChart from './components/LineChart';
import StateMap from './components/StateMap';

import { useLastActiveQuestion } from '~/app/hooks/useLastActiveQuestion';
import { addColorToResults, analyzeVoteData } from '../../lib/utils';
import type { DemographicFilters } from '../../lib/api/results';

export default function Results() {
  const [filteredDemographics, setFilteredDemographics] = useState<DemographicFilters>({});
  const { data: lastQuestion, isLoading: isQuestionLoading, error: questionError } = useLastActiveQuestion();
  const { data: totalResults, isLoading, error } = useResults(lastQuestion?.id);
  const resultData = totalResults?.data;
  const isPopulatedFilter = Object.values(filteredDemographics).some(values => values.length > 0);

  if (error || questionError) {
    return (
      <View className="flex justify-center items-center">
        <Text>Failed to load results</Text>
      </View>
    );
  }

  if (isLoading || isQuestionLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!lastQuestion || !resultData) {
    return (
      <View className="flex justify-center items-center">
        <Text>No results available yet</Text>
      </View>
    );
  }

  const { question, totalVotes, results, user_vote, user_prediction, stateResults } = resultData;
  const coloredResults = addColorToResults(results) ?? [];
  let myStats: ReturnType<typeof analyzeVoteData> | null = null;
  if (
    coloredResults.length > 0 && totalVotes > 0 && user_vote && user_prediction &&
    coloredResults.some(option => option.optionId === user_vote) &&
    coloredResults.some(option => option.optionId === user_prediction)
  ) {
    myStats = analyzeVoteData(coloredResults, { totalVotes, user_vote, user_prediction });
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
