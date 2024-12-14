import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
  useDerivedValue,
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
}

const AnimatedDonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 200,
  strokeWidth = 25,
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

    progress.value = withSpring(1, {
      damping: 20,
      stiffness: 20,
      mass: 1,
      duration: 3000,
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
        <Svg width={size} height={size} style={styles.svg}>
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke="#56a5f5" //{data[0].color}
            strokeWidth={strokeWidth}
            fill="none"
            animatedProps={animatedProps1}
            originX={center}
            originY={center}
            strokeLinecap="butt"
          />
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke="#eb8f49" //{data[1].color}
            strokeWidth={strokeWidth}
            fill="none"
            animatedProps={animatedProps2}
            originX={center}
            originY={center}
            strokeLinecap="butt"
          />
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
  },
  svg: {
    transform: [{ rotate: '90deg' }],
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
