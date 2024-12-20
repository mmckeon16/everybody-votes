import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '~/components/ui/text';

import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DataItem {
  text: string;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  data: [DataItem, DataItem];
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

const AnimatedDonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 200,
  strokeWidth = 25,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const progress = useSharedValue(0);

  // Calculate the size for the center content
  const centerContentSize = Math.floor(radius * 1.4);

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
      <View style={[styles.container, { width: size, height: size }]}>
        <View
          style={{
            position: 'absolute',
            width: centerContentSize,
            height: centerContentSize,
            left: (size - centerContentSize) / 2,
            top: (size - centerContentSize) / 2,
            zIndex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </View>
        <Svg width={size} height={size}>
          <G rotation={90} origin={`${center}, ${center}`}>
            <AnimatedCircle
              cx={center}
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
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={item.text} style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.text} ({item.percentage}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  legendContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#334155',
  },
});

export default AnimatedDonutChart;
