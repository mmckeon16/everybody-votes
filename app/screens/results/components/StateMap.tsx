import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import Svg, { Path } from 'react-native-svg';
import { Card } from '~/components/ui/card';
import { STATE_PATHS, mockData } from '../constants';

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
  const [activeState, setActiveState] = useState<string | null>(null);

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

  const getTooltipText = (
    stateId: string,
    stateData?: StateVotingData
  ): string[] => {
    if (!stateData) return [`${stateId}`, 'No data'];
    const option1Percent = getOption1Percentage(stateData).toFixed(1);
    const option2Percent = (100 - getOption1Percentage(stateData)).toFixed(1);
    return [
      stateId,
      `${stateData.option1_hash.text}: ${option1Percent}%`,
      `${stateData.option2_hash.text}: ${option2Percent}%`,
    ];
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
        <View className="relative w-full aspect-[2.8/1]">
          <Svg
            viewBox="400 440 700 300"
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
            <View className="absolute bottom-4 right-4 rounded-lg shadow-md p-3 border border-gray-200">
              {getTooltipText(activeState, votingData[activeState]).map(
                (line, index) => (
                  <Text
                    key={index}
                    className={`${
                      index === 0 ? 'font-bold text-lg mb-1' : 'text-sm'
                    }`}
                  >
                    {line}
                  </Text>
                )
              )}
            </View>
          )}
        </View>

        <View className="flex-row justify-center space-x-8">
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
