import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import InlinePieChart from './InlinePieChart';
import { useResults } from '../../../hooks/useResults';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { addColorToResults } from '../../../lib/utils';

interface FilterResultsProps {
  filteredDemographics: object;
  activeQuestion: object;
  setFilteredDemographics: Function;
  totalVotes: number;
}

const FilterResultsCard: React.FC<FilterResultsProps> = ({
  filteredDemographics,
  activeQuestion,
  setFilteredDemographics,
  totalVotes,
}) => {
  const { data: filteredResults, isLoading } = useResults(
    activeQuestion?.id,
    filteredDemographics
  );

  console.log('Data from filtered....', filteredResults);
  console.log(filteredResults);
  const nullData = { question: null, totalVotes: null, results: null };
  const {
    data: { totalVotes: totalFilteredVotes, results, error } = nullData,
  } = filteredResults || {};

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
    <Card className="max-w-3xl mx-6 w-full">
      <CardContent className="pt-6">
        {results && results.length === 2 && (
          <View className="w-full flex justify-center">
            <InlinePieChart
              data={addColorToResults(results)}
              size={100}
              strokeWidth={25}
              totalFilteredVotes={totalFilteredVotes}
              totalVotes={totalVotes}
              filters={filteredDemographics}
              setFilters={setFilteredDemographics}
            />
          </View>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterResultsCard;
