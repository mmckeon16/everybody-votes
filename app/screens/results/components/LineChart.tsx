import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import UserStatsBadge from './UserStatsBadge';
import MediaQuery, { Breakpoints } from '~/components/ui/MediaQuery';

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
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{question.text}</CardTitle>
        <Text className="text-sm text-gray-500">{totalVotes} votes</Text>
      </CardHeader>
      <CardContent>
        <View className="space-y-4">
          {results.map(result => (
            <View key={result.optionId} className="space-y-2">
              <MediaQuery {...Breakpoints.xs}>
                <View className="w-fit">
                  <UserStatsBadge
                    optionId={result.optionId}
                    user_prediction={user_prediction}
                    user_vote={user_vote}
                    myStats={myStats}
                  />
                </View>
              </MediaQuery>
              <View className="flex-row justify-between items-center flex-wrap">
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-lg font-medium">
                    {result.optionText}
                  </Text>
                  <MediaQuery {...Breakpoints.xs} not>
                    <View className=" ml-2">
                      <UserStatsBadge
                        optionId={result.optionId}
                        user_prediction={user_prediction}
                        user_vote={user_vote}
                        myStats={myStats}
                      />
                    </View>
                  </MediaQuery>
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
