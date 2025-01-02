import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

interface MyStatsProps {
  isCorrectPrediction: boolean;
  userVotedPerc: string;
  userVotedMajority: boolean;
  userVotedColor: string;
  userPredictedColor: string;
}

const MyStats: React.FC<MyStatsProps> = ({
  isCorrectPrediction,
  userVotedPerc,
  userVotedMajority,
  userVotedColor = '#246EF0', // bg-lightBlue
  userPredictedColor = '#02245e', // bg-midnight
}) => {
  console.log('isCorrectPrediction: ', isCorrectPrediction);
  console.log('userVotedPerc: ', userVotedPerc);
  console.log('userVotedMajority: ', userVotedMajority);
  console.log('userVotedColor: ', userVotedColor);

  const iconSize = 40;
  return (
    <View className="flex flex-row gap-3 w-full max-w-3xl">
      <Card
        className="flex-1 max-w-3xl h-full"
        style={{ backgroundColor: userVotedColor }}
      >
        <CardContent className="p-4 flex-1">
          <View className="flex flex-row gap-3">
            <View className="flex-1 gap-2">
              <Text className="flex-wrap text-white	">
                You voted with {userVotedPerc} of the population
              </Text>
              <View className="flex ">
                {userVotedMajority ? (
                  <FontAwesome6
                    name="people-group"
                    size={iconSize}
                    color="white"
                  />
                ) : (
                  <FontAwesome6
                    name="person-shelter"
                    size={iconSize}
                    color="white"
                  />
                )}
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
      <Card
        style={{ backgroundColor: userPredictedColor }}
        className="max-w-3xl flex-1"
      >
        <CardContent className="p-4 flex-1">
          <View className="flex flex-col gap-2 justify-between flex-1	h-full">
            <View className="flex-1 justify-between	 gap-2">
              <Text className="flex-wrap text-white">
                {isCorrectPrediction
                  ? 'Your prediction was spot on'
                  : 'You predicted wrong'}
              </Text>
              <View className="flex">
                {isCorrectPrediction ? (
                  <Ionicons
                    name="happy-outline"
                    size={iconSize}
                    color="white"
                  />
                ) : (
                  <FontAwesome5 name="sad-cry" size={iconSize} color="white" />
                )}
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default MyStats;
