import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { CheckCircle, Target } from 'lucide-react-native';

interface PollStats {
  isCorrectPrediction?: boolean;
  userVotedPerc?: number;
  userVotedMajority?: boolean;
  userVotedColor?: string;
  userPredictedColor?: string;
}
interface UserStatsBadgeProps {
  optionId: string;
  totalVotes: number;
  user_prediction: string;
  user_vote: string;
  myStats?: PollStats;
}

const UserStatsBadge: React.FC<UserStatsBadgeProps> = ({
  optionId,
  user_prediction,
  user_vote,
  myStats,
}) => {
  return optionId === user_vote && optionId === user_prediction ? (
    <View className="flex-row items-center bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-2 py-1">
      <View className="flex-row items-center">
        <CheckCircle
          className="w-4 h-4"
          color={myStats?.userVotedColor || '#16a34a'}
        />
        <Target
          className="w-4 h-4 ml-1"
          color={myStats?.userPredictedColor || '#2563eb'}
        />
      </View>
      <Text
        className="ml-1"
        style={{
          color: myStats?.userVotedColor || '#16a34a',
        }}
      >
        Your Vote & Prediction
      </Text>
    </View>
  ) : (
    <View>
      {optionId === user_vote && (
        <View className="flex-row items-center bg-green-100 rounded-full px-2 py-1">
          <CheckCircle
            className="w-4 h-4 mr-1"
            color={myStats?.userVotedColor || '#16a34a'}
          />
          <Text
            style={{
              color: myStats?.userVotedColor || '#16a34a',
            }}
          >
            Your Vote
          </Text>
        </View>
      )}
      {optionId === user_prediction && (
        <View className="flex-row items-center bg-blue-100 rounded-full px-2 py-1">
          <Target
            className="w-4 h-4 mr-1"
            color={myStats?.userPredictedColor || '#2563eb'}
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
  );
};

export default UserStatsBadge;
