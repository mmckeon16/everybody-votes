import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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
  optionText: string;
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
  const [mounted, setMounted] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const progress = useSharedValue(0);

  useEffect(() => {
    setMounted(true);

    if (data.length !== 2) {
      console.warn('Exactly two data items are required');
      return;
    }

    const sum = data[0].percentage + data[1].percentage;
    if (Math.abs(sum - 100) > 0.1) {
      console.warn('Values must sum to 100');
      return;
    }

    // Delay the animation start
    progress.value = withDelay(
      100, // Small delay to ensure proper positioning
      withTiming(1, {
        duration: 2000,
        easing: Easing.bezier(0.16, 0, 0.4, 1),
      })
    );
  }, [data]);

  if (!mounted) {
    return null;
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
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
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View
        style={[
          styles.childrenContainer,
          {
            position: 'absolute',
            width: size,
            height: size,
            left: 0,
            top: 0,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
  childrenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});

export default AnimatedDonutChart;
