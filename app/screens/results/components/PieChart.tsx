import React, { useEffect, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
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
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const progress = useSharedValue(0);
  const centerContentSize = Math.floor(radius * 1.4);

  const onLayout = (event: LayoutChangeEvent) => {
    setLayout(event.nativeEvent.layout);
  };

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
    originX: center,
    originY: center,
    rotation: 180,
  }));

  const animatedProps2 = useAnimatedProps(() => ({
    strokeDasharray: `${segment2Length.value} ${circumference}`,
    strokeDashoffset: -circumference + segment2Length.value,
    originX: center,
    originY: center,
    rotation: 180,
  }));

  return (
    <View
      style={[styles.wrapper, { width: size, height: size }]}
      onLayout={onLayout}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.centerContent,
            {
              width: centerContentSize,
              height: centerContentSize,
              left: (size - centerContentSize) / 2,
              top: (size - centerContentSize) / 2,
            },
          ]}
        >
          {children}
        </View>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  centerContent: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default AnimatedDonutChart;
