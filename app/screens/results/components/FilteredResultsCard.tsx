import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import PieChart from './PieChart';
import { useResults } from '../../../hooks/useResults';
import { Text } from '~/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import NumberFlipper from './NumberFlipper';
import { addColorToResults } from '../../../lib/utils';

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

  // TODO add in prediction
  return (
    <View className="flex-column items-center overflow-hidden flex-1">
      <Card className="max-w-3xl m-6">
        <CardHeader className="items-center">
          <CardTitle className="pb-2 text-center">{question?.text}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredResults && filteredResults.length === 2 && (
            <View className="flex items-center flex-1">
              <PieChart
                data={addColorToResults(filteredResults)}
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
    </View>
  );
};

export default FilterResultsCard;
