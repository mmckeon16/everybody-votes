import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import InlinePieChart from './InlinePieChart';
import { useResults } from '../../../hooks/useResults';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { addColorToResults } from '../../../lib/utils';
import type { DemographicFilters } from '../../../lib/api/results';

interface FilterResultsProps {
  filteredDemographics: DemographicFilters;
  activeQuestion: { id: string };
  setFilteredDemographics: React.Dispatch<React.SetStateAction<DemographicFilters>>;
  totalVotes: number;
}

const FilterResultsCard: React.FC<FilterResultsProps> = ({
  filteredDemographics,
  activeQuestion,
  setFilteredDemographics,
  totalVotes,
}) => {
  const { data: filteredResults, isLoading, error } = useResults(
    activeQuestion?.id,
    filteredDemographics
  );

  if (error) {
    return (
      <View className="flex justify-center items-center">
        <Text>Failed to load results</Text>
      </View>
    );
  }

  if (isLoading || !filteredResults) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const { totalVotes: totalFilteredVotes, results } = filteredResults.data;
  const coloredResults = addColorToResults(results) ?? [];

  return (
    <Card className="max-w-3xl mx-6 w-full">
      <CardContent className="pt-6">
        {coloredResults.length === 2 && (
          <View className="w-full flex justify-center">
            <InlinePieChart
              data={[coloredResults[0], coloredResults[1]]}
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
