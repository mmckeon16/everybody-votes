import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '~/components/ui/text';
import DemographicPills from './Pills';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated';
import { DemographicKey } from '../../../types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DataItem {
  optionText: string;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  data: [DataItem, DataItem];
  size?: number;
  strokeWidth?: number;
  totalVotes?: number;
  filters?: object;
  setFilters: Function;
}

const AnimatedDonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 100,
  strokeWidth = 15,
  totalVotes,
  filters = null,
  setFilters,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const progress = useSharedValue(0);

  useEffect(() => {
    if (data.length !== 2) {
      console.warn('Exactly two data items are required');
      return;
    }

    const sum = data[0].percentage + data[1].percentage;
    if (Math.abs(sum - 100) > 0.1) {
      console.warn('Values must sum to 100');
      return;
    }

    progress.value = withTiming(1, {
      duration: 2000,
      easing: Easing.bezier(0.16, 0, 0.4, 1),
    });
  }, [data]);

  const handleRemove = (
    category: DemographicKey,
    originalValue: string | number
  ) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category]?.filter(v => v !== originalValue),
    }));
  };

  const segment1Length = useDerivedValue(() => {
    return (data[0].percentage / 100) * circumference * progress.value;
  });

  const segment2Length = useDerivedValue(() => {
    return (data[1].percentage / 100) * circumference * progress.value;
  });

  const animatedProps1 = useAnimatedProps(() => ({
    strokeDasharray: `${segment1Length.value} ${circumference}`,
    strokeDashoffset: 0,
    transform: [{ rotate: '-90deg' }],
  }));

  const animatedProps2 = useAnimatedProps(() => ({
    strokeDasharray: `${segment2Length.value} ${circumference}`,
    strokeDashoffset: -circumference + segment2Length.value,
    transform: [{ rotate: '90deg' }],
  }));

  return (
    <View style={styles.wrapper}>
      {/* Left side: Information */}
      <View style={styles.infoContainer}>
        <View style={styles.filtersContainer}>
          <DemographicPills data={filters} onRemove={handleRemove} />
          {/* <Text style={styles.filtersText}>{filters}</Text> */}
        </View>
        <View style={styles.totalVotesContainer}>
          <Text style={styles.totalVotesNumber}>{totalVotes}</Text>
          <Text style={styles.totalVotesText}>votes</Text>
        </View>
        <View style={styles.totalVotesContainer}>
          <Text style={styles.totalVotesNumber}>percent%</Text>
          <Text style={styles.totalVotesText}>of total</Text>
        </View>
        <View style={styles.legendContainer}>
          {data.map(item => (
            <View key={item.optionText} style={styles.legendItem}>
              <View
                style={[styles.colorBox, { backgroundColor: item.color }]}
              />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendLabel}>{item.optionText}</Text>
                <Text style={styles.legendPercentage}>
                  {Math.round(item.percentage * 10) / 10}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Right side: Chart */}
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <G rotation={90} origin={`${center}, ${center}`}>
            <AnimatedCircle
              cx={center}
              key={`donut-segment-${data[0]?.optionText}`}
              cy={center}
              r={radius}
              stroke={data[0].color}
              strokeWidth={strokeWidth}
              fill="none"
              animatedProps={animatedProps1}
              originX={center}
              originY={center}
              strokeLinecap="round"
            />
            <AnimatedCircle
              cx={center}
              key={`donut-segment-${data[1]?.optionText}`}
              cy={center}
              r={radius}
              stroke={data[1].color}
              strokeWidth={strokeWidth}
              fill="none"
              animatedProps={animatedProps2}
              originX={center}
              originY={center}
              strokeLinecap="round"
            />
          </G>
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoContainer: {
    flex: 1,
    marginRight: 16,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersText: {
    flexWrap: 'wrap',
    fontSize: 14,
    color: '#64748b',
  },
  totalVotesContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  totalVotesText: {
    fontSize: 16,
    color: '#64748b',
  },
  totalVotesNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
  },
  legendContainer: {
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 14,
    color: '#334155',
    flexShrink: 1,
  },
  legendPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
});

export default AnimatedDonutChart;
