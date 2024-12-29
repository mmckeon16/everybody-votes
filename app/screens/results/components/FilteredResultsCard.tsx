import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import InlinePieChart from './InlinePieChart';
import { useResults } from '../../../hooks/useResults';
import { Text } from '~/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { addColorToResults, formatFilters } from '../../../lib/utils';

interface FilterResultsProps {
  filteredDemographics: object;
  activeQuestion: object;
}

const FilterResultsCard: React.FC<FilterResultsProps> = ({
  filteredDemographics,
  activeQuestion,
}) => {
  const { data: filteredResults, isLoading, error } = useResults(
    activeQuestion?.id,
    filteredDemographics
  );

  console.log('Data from filtered....', filteredResults);
  console.log(filteredResults);
  const nullData = { question: null, totalVotes: null, results: null };
  const { data: { question, totalVotes, results } = nullData } =
    filteredResults || {};

  const filters = formatFilters(filteredDemographics);

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
    <Card className="max-w-3xl m-6 w-full">
      <CardContent className="pt-6">
        {results && results.length === 2 && (
          <View className="w-full flex justify-center">
            <InlinePieChart
              data={addColorToResults(results)}
              size={100}
              strokeWidth={25}
              totalVotes={totalVotes}
              filters={filters}
            />
          </View>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterResultsCard;
