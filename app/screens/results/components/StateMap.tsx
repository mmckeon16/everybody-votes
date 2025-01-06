import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text } from '~/components/ui/text';
import Svg, { Path } from 'react-native-svg';
import { Card } from '~/components/ui/card';
import { STATE_PATHS, mockData } from '../constants';
import { Button } from '~/components/ui/button';

interface VoteOption {
  text: string;
  votes: number;
}

interface StateVotingData {
  option1_hash: VoteOption;
  option2_hash: VoteOption;
  totalVotes: number;
}

interface VotingDataMap {
  [stateId: string]: StateVotingData;
}

interface USVoteHeatMapProps {
  votingData?: VotingDataMap;
}

const USVoteHeatMap: React.FC<USVoteHeatMapProps> = ({}) => {
  const votingData = mockData;
  const insets = useSafeAreaInsets();
  const [activeState, setActiveState] = useState<string | null>('AK');

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const getOption1Percentage = (stateData?: StateVotingData): number => {
    if (!stateData || stateData.totalVotes === 0) return 0;
    return (stateData.option1_hash.votes / stateData.totalVotes) * 100;
  };

  const getStateColor = (stateData?: StateVotingData): string => {
    if (!stateData) return '#CCCCCC';
    const option1Percentage = getOption1Percentage(stateData);

    // #c208c9 (pink/magenta)
    const startColor = {
      r: 194, // c2
      g: 8, // 08
      b: 201, // c9
    };

    // #0879C4 (blue)
    const endColor = {
      r: 8, // 08
      g: 121, // 79
      b: 196, // c4
    };

    // Keep the same easing function for smooth transitions
    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const t = easeInOutCubic(option1Percentage / 100);
    const r = Math.round(startColor.r * (1 - t) + endColor.r * t);
    const g = Math.round(startColor.g * (1 - t) + endColor.g * t);
    const b = Math.round(startColor.b * (1 - t) + endColor.b * t);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const firstStateWithData = Object.values(votingData)[0];
  const option1Text = firstStateWithData?.option1_hash.text || 'Yes';
  const option2Text = firstStateWithData?.option2_hash.text || 'No';

  return (
    <Card className="w-full max-w-3xl rounded-lg shadow-lg">
      <View className="p-4">
        <Text className="text-xl font-bold">US Voting Distribution</Text>
      </View>
      <View className="p-4 space-y-4">
        <View className="relative w-full aspect-[1.5/1]">
          <Svg
            viewBox="500 400 550 300"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {Object.entries(STATE_PATHS).map(([stateId, pathData]) => (
              <Path
                key={stateId}
                d={pathData}
                stroke={activeState === stateId ? 'white' : 'none'}
                strokeWidth={activeState === stateId ? 2 : 0}
                fill={getStateColor(votingData[stateId])}
                opacity={0.9}
                onPress={() => setActiveState(stateId)}
              />
            ))}
          </Svg>

          {/* Active State Legend Overlay */}
          {activeState && (
            <View className="absolute -top-[70px] -right-2 rounded-lg shadow-md p-3 border border-gray-200 bg-background">
              <View className="flex flex-col gap-1">
                <View className="flex flex-row justify-between items-center">
                  <Text className="font-bold text-lg">{activeState}</Text>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7"
                    onPress={() => console.log('on pressed!')}
                  >
                    <MaterialIcons name="expand-more" size={16} color="black" />
                  </Button>
                </View>
                <Text className="text-sm">
                  {votingData[activeState]?.option1_hash.text}:{' '}
                  {getOption1Percentage(votingData[activeState]).toFixed(1)}%
                </Text>
                <Text className="text-sm">
                  {votingData[activeState]?.option2_hash.text}:{' '}
                  {(
                    100 - getOption1Percentage(votingData[activeState])
                  ).toFixed(1)}
                  %
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="flex-row justify-center gap-8">
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-lightBlue rounded" />
            <Text className="ml-2 text-sm">{option1Text}</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-midnight rounded" />
            <Text className="ml-2 text-sm">{option2Text}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

export default USVoteHeatMap;
