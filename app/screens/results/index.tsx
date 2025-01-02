import React, { useState } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
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
import MyStats from './components/MyStats';
import { useActiveQuestion } from '~/app/hooks/useActiveQuestion';
import { addColorToResults, analyzeVoteData } from '../../lib/utils';

export default function Results() {
  const [filteredDemographics, setFilteredDemographics] = useState(null);
  const { data: activeQuestion } = useActiveQuestion();

  const { data: totalResults, isLoading, error } = useResults(
    activeQuestion?.id
  );
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
    } = nullData,
  } = totalResults || {};

  let isPopulatedFilter = null;
  if (filteredDemographics) {
    isPopulatedFilter = Object.values(filteredDemographics).some(
      arr => arr.length > 0
    );
  }

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
        <Card className="max-w-3xl mx-6 w-full">
          <CardHeader className="items-center px-4">
            <CardTitle className="pb-2 text-center w-full">
              {question?.text}
            </CardTitle>
            <CardDescription className="self-start">
              <FilterModal
                filteredDemographics={filteredDemographics}
                setFilteredDemographics={setFilteredDemographics}
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            {coloredResults && coloredResults.length === 2 && (
              <View className="w-full flex justify-center">
                <PieChart data={coloredResults} size={200} strokeWidth={25}>
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
        {filteredDemographics && isPopulatedFilter && (
          <FilteredResultsCard
            filteredDemographics={filteredDemographics}
            activeQuestion={activeQuestion}
            setFilteredDemographics={setFilteredDemographics}
            totalVotes={totalVotes}
          />
        )}
        {myStats && (
          <MyStats
            isCorrectPrediction={myStats?.isCorrectPrediction}
            userVotedPerc={myStats?.userVotedPerc}
            userVotedMajority={myStats?.userVotedMajority}
            // userVotedColor={myStats?.userVotedColor}
            // userPredictedColor={myStats?.userPredictedColor}
          />
        )}
      </View>
    </ScrollView>
  );
}
