import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { CheckCircle, Target } from 'lucide-react-native';

interface PollOption {
  optionId: string;
  optionText: string;
  votes: number;
  percentage: number;
  responses: any[];
}

interface PollStats {
  isCorrectPrediction?: boolean;
  userVotedPerc?: number;
  userVotedMajority?: boolean;
  userVotedColor?: string;
  userPredictedColor?: string;
}

interface LineChartProps {
  // isCorrectPrediction: boolean;
  // userVotedPerc: string;
  // userVotedMajority: boolean;
  // userVotedColor: string;
  // userPredictedColor: string;
  question: {
    id: string;
    text: string;
  };
  results: PollOption[];
  totalVotes: number;
  user_prediction: string;
  user_vote: string;
  myStats?: PollStats;
}

const LineChart: React.FC<LineChartProps> = ({
  question,
  results,
  totalVotes,
  user_prediction,
  user_vote,
  myStats,
}) => {
  return (
    <Card className="w-full max-w-3xl bg-white">
      <CardHeader>
        <CardTitle>{question.text}</CardTitle>
        <Text className="text-sm text-gray-500">{totalVotes} votes</Text>
      </CardHeader>
      <CardContent>
        <View className="space-y-4">
          {results.map(result => (
            <View key={result.optionId} className="space-y-2">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-2">
                  <Text className="text-lg font-medium">
                    {result.optionText}
                  </Text>
                  {result.optionId === user_vote && (
                    <View className="flex-row items-center bg-green-100 rounded-full px-2 py-1">
                      <CheckCircle
                        className="w-4 h-4 mr-1"
                        color={myStats?.userVotedColor || '#16a34a'} // Default to green-600
                      />
                      <Text
                        style={{ color: myStats?.userVotedColor || '#16a34a' }}
                      >
                        Your Vote
                      </Text>
                    </View>
                  )}
                  {result.optionId === user_prediction && (
                    <View className="flex-row items-center bg-blue-100 rounded-full px-2 py-1">
                      <Target
                        className="w-4 h-4 mr-1"
                        color={myStats?.userPredictedColor || '#2563eb'} // Default to blue-600
                      />
                      <Text
                        style={{
                          color: myStats?.userPredictedColor || '#2563eb',
                        }}
                      >
                        Your Prediction
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-lg font-semibold">
                  {result.percentage.toFixed(1)}%
                </Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${result.percentage}%`,
                    backgroundColor: result.color ? result.color : 'black',
                  }}
                />
              </View>
              <Text className="text-sm text-gray-500">
                {result.votes} votes
              </Text>
            </View>
          ))}
        </View>

        {user_prediction !== user_vote && !myStats?.isCorrectPrediction && (
          <Text className="mt-6 text-gray-600">
            Your prediction was different from your vote and went against the
            majority
          </Text>
        )}

        {myStats?.userVotedPerc && (
          <Text className="mt-2 text-sm text-gray-500">
            {myStats.userVotedMajority
              ? `You voted with the majority (${myStats.userVotedPerc} of voters)`
              : `You voted with the minority (${myStats.userVotedPerc} of voters)`}
          </Text>
        )}
      </CardContent>
    </Card>
  );
};

export default LineChart;
