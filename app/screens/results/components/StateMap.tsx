import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Platform,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';
import { Text } from '~/components/ui/text';
import Svg, { Path } from 'react-native-svg';
import { Card } from '~/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '~/components/ui/select';
import { STATE_PATHS, mockData } from '../constants';
import { states } from '../../../auth/constants';

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
  const [activeState, setActiveState] = useState<string | null>('AK');
  const svgRef = useRef<View>(null);
  const [svgLayout, setSvgLayout] = useState({ width: 0, height: 0 });

  const getOption1Percentage = (stateData?: StateVotingData): number => {
    if (!stateData || stateData.totalVotes === 0) return 0;
    return (stateData.option1_hash.votes / stateData.totalVotes) * 100;
  };

  const getStateColor = (stateData?: StateVotingData): string => {
    if (!stateData) return '#CCCCCC';
    const option1Percentage = getOption1Percentage(stateData);

    const startColor = {
      r: 194,
      g: 8,
      b: 201,
    };

    const endColor = {
      r: 8,
      g: 121,
      b: 196,
    };

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

  const handleLayout = (event: LayoutChangeEvent) => {
    setSvgLayout({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  const handleAndroidPress = (event: GestureResponderEvent) => {
    if (Platform.OS === 'ios') return;

    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = svgLayout;

    // Create normalized coordinates (0-1 range)
    const normalizedX = locationX / width;
    const normalizedY = locationY / height;

    // Map normalized coordinates to viewBox space
    const viewBoxX = 500 + normalizedX * 550;
    const viewBoxY = 400 + normalizedY * 300;

    // Find closest state center point
    let closestState = null;
    let minDistance = Infinity;

    // You'll need to define state centers - this is an example
    const stateCenters = {
      AK: { x: 525, y: 625 },
      AL: { x: 850, y: 575 },
      AR: { x: 775, y: 550 },
      AZ: { x: 600, y: 550 },
      CA: { x: 550, y: 500 },
      CO: { x: 650, y: 500 },
      CT: { x: 975, y: 450 },
      DE: { x: 950, y: 475 },
      FL: { x: 900, y: 625 },
      GA: { x: 875, y: 575 },
      HI: { x: 575, y: 650 },
      IA: { x: 750, y: 475 },
      ID: { x: 575, y: 450 },
      IL: { x: 800, y: 475 },
      IN: { x: 825, y: 475 },
      KS: { x: 700, y: 525 },
      KY: { x: 825, y: 500 },
      LA: { x: 775, y: 600 },
      MA: { x: 975, y: 435 },
      MD: { x: 925, y: 475 },
      ME: { x: 1000, y: 425 },
      MI: { x: 825, y: 450 },
      MN: { x: 750, y: 425 },
      MO: { x: 775, y: 525 },
      MS: { x: 800, y: 575 },
      MT: { x: 600, y: 425 },
      NC: { x: 900, y: 525 },
      ND: { x: 675, y: 425 },
      NE: { x: 700, y: 475 },
      NH: { x: 975, y: 425 },
      NJ: { x: 950, y: 460 },
      NM: { x: 625, y: 550 },
      NV: { x: 550, y: 475 },
      NY: { x: 925, y: 435 },
      OH: { x: 850, y: 475 },
      OK: { x: 700, y: 550 },
      OR: { x: 550, y: 450 },
      PA: { x: 900, y: 460 },
      RI: { x: 990, y: 445 },
      SC: { x: 875, y: 550 },
      SD: { x: 675, y: 450 },
      TN: { x: 825, y: 525 },
      TX: { x: 700, y: 600 },
      UT: { x: 600, y: 500 },
      VA: { x: 900, y: 500 },
      VT: { x: 950, y: 425 },
      WA: { x: 550, y: 425 },
      WI: { x: 775, y: 450 },
      WV: { x: 875, y: 485 },
      WY: { x: 625, y: 475 },
    };

    Object.entries(stateCenters).forEach(([stateId, center]) => {
      const distance = Math.sqrt(
        Math.pow(viewBoxX - center.x, 2) + Math.pow(viewBoxY - center.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestState = stateId;
      }
    });

    if (closestState) {
      setActiveState(closestState);
    }
  };

  return (
    <Card className="w-full max-w-3xl rounded-lg shadow-lg">
      <View className="p-4">
        <Text className="text-xl font-bold">US Voting Distribution</Text>
      </View>
      <View className="p-4 space-y-4">
        <View
          ref={svgRef}
          onLayout={handleLayout}
          className="relative w-full aspect-[1.5/1]"
        >
          <Svg
            viewBox="500 400 550 300"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            onStartShouldSetResponder={() => true}
            onResponderRelease={handleAndroidPress}
          >
            {Object.entries(STATE_PATHS).map(([stateId, pathData]) => (
              <Path
                key={stateId}
                d={pathData}
                stroke={activeState === stateId ? 'white' : 'none'}
                strokeWidth={activeState === stateId ? 2 : 0}
                fill={getStateColor(votingData[stateId])}
                opacity={0.9}
                {...(Platform.OS === 'ios' || Platform.OS === 'web'
                  ? { onPress: () => setActiveState(stateId) }
                  : {})}
              />
            ))}
          </Svg>

          {/* Active State Legend Overlay */}
          {activeState && (
            <View className="absolute -top-[70px] -right-2 rounded-lg shadow-md p-3 border border-gray-200 bg-background">
              <View className="flex flex-col gap-1">
                <View className="flex flex-row justify-between gap-2 items-center">
                  <Text className="font-bold text-lg">{activeState}</Text>
                  <Select
                    id="state"
                    onValueChange={({ value }) => {
                      setActiveState(value);
                    }}
                  >
                    <SelectTrigger className="w-max" />
                    <SelectContent>
                      {/* Search Input */}

                      <SelectGroup>
                        <SelectLabel>
                          <Text>US State</Text>
                        </SelectLabel>
                        <ScrollView>
                          {states.map(state => (
                            <SelectItem
                              label={state.label}
                              value={
                                state.value === 'not-in-us'
                                  ? 'Not US'
                                  : state.value
                              }
                              key={state.value}
                            />
                          ))}
                        </ScrollView>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </View>
                {votingData[activeState] !== null ? (
                  <View>
                    <Text className="text-sm">
                      {votingData[activeState]?.option1_hash.text}:{' '}
                      {getOption1Percentage(votingData[activeState]).toFixed(1)}
                      %
                    </Text>
                    <Text className="text-sm">
                      {votingData[activeState]?.option2_hash.text}:{' '}
                      {(
                        100 - getOption1Percentage(votingData[activeState])
                      ).toFixed(1)}
                      %
                    </Text>
                  </View>
                ) : (
                  <Text className="text-sm">No data available</Text>
                )}
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
