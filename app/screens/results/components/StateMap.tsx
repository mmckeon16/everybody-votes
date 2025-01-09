import React, { useState, useRef } from 'react';
import {
  View,
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
import { STATE_PATHS } from '../constants';
import { states } from '../../../auth/constants';

interface VoteOption {
  text: string;
  votes: number;
}

interface StateResult {
  state: string;
  totalVotes: number;
  [key: string]: VoteOption | string | number; // For dynamic UUID keys
}

interface USVoteHeatMapProps {
  stateResults: StateResult[];
}

const USVoteHeatMap: React.FC<USVoteHeatMapProps> = ({ stateResults }) => {
  const [activeState, setActiveState] = useState<string | null>('AK');
  const svgRef = useRef<View>(null);
  const [svgLayout, setSvgLayout] = useState({ width: 0, height: 0 });

  // Convert array to map for easier lookup
  const votingData = stateResults.reduce((acc, curr) => {
    const options = Object.entries(curr).reduce((optAcc, [key, value]) => {
      if (typeof value === 'object' && 'votes' in value && 'text' in value) {
        optAcc[key] = value;
      }
      return optAcc;
    }, {} as Record<string, VoteOption>);

    acc[curr.state] = {
      totalVotes: curr.totalVotes,
      ...options,
    };
    return acc;
  }, {} as Record<string, { totalVotes: number } & Record<string, VoteOption>>);

  const getOption1Percentage = (
    stateData?: typeof votingData[string]
  ): number => {
    if (!stateData) return 0;

    // Get the first option's votes
    const options = Object.values(stateData).filter(
      (value): value is VoteOption =>
        typeof value === 'object' && 'votes' in value && 'text' in value
    );

    if (options.length === 0 || stateData.totalVotes === 0) return 0;
    return (options[0].votes / stateData.totalVotes) * 100;
  };

  const getStateColor = (stateData?: typeof votingData[string]): string => {
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

  // Get option texts from the first state result
  const firstStateWithData = stateResults[0];
  const options = Object.entries(firstStateWithData)
    .filter(
      ([_, value]): value is [string, VoteOption] =>
        typeof value === 'object' && 'text' in value && 'votes' in value
    )
    .map(([_, value]) => value);

  const option1Text = options[0]?.text || 'Yes';
  const option2Text = options[1]?.text || 'No';

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
      <View className="p-4 gap-4">
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

          {activeState && (
            <View className="absolute -top-[70px] -right-2 rounded-lg shadow-md p-3 border border-gray-200 bg-background">
              <View className="flex flex-col gap-1">
                <View className="flex flex-row justify-between gap-2 items-center">
                  <Text className="font-bold text-lg">{activeState}</Text>
                  <Select
                    id="state"
                    defaultOpen={false}
                    onValueChange={({ value }) => {
                      setActiveState(value);
                    }}
                  >
                    <SelectTrigger className="w-max" />
                    <SelectContent
                      className={Platform.select({
                        web:
                          'rounded-md overflow-hidden z-50 shadow-lg border border-gray-200',
                        default:
                          'rounded-md overflow-hidden z-50 shadow-lg border border-gray-200 w-[80%] self-center mx-auto',
                      })}
                    >
                      <SelectGroup>
                        <SelectLabel className="px-2 py-1.5 border-b border-gray-200 z-10 bg-background">
                          <Text className="font-medium">US State</Text>
                        </SelectLabel>
                        <View className="py-1">
                          {states.map(state => (
                            <SelectItem
                              key={state.value}
                              className="px-2 py-2 hover:bg-gray-100 active:bg-gray-200 flex flex-row items-center justify-between w-full"
                              label={state.label}
                              value={
                                state.value === 'not-in-us'
                                  ? 'Not US'
                                  : state.value
                              }
                            />
                          ))}
                        </View>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </View>
                {activeState && votingData[activeState] ? (
                  <View>
                    {Object.entries(votingData[activeState])
                      .filter(
                        ([_, value]): value is [string, VoteOption] =>
                          typeof value === 'object' &&
                          'text' in value &&
                          'votes' in value
                      )
                      .map(([_, option], index) => (
                        <Text key={index} className="text-sm">
                          {option.text}:{' '}
                          {(
                            (option.votes /
                              votingData[activeState].totalVotes) *
                            100
                          ).toFixed(1)}
                          %
                        </Text>
                      ))}
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
