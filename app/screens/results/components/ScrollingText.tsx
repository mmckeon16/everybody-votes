import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';

interface ScrollingTextProps {
  text: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  speed?: number;
}

const ScrollingText: React.FC<ScrollingTextProps> = ({
  text,
  style,
  textStyle,
  speed = 50,
}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isTextTruncated, setIsTextTruncated] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleTextLayout = (event: LayoutChangeEvent) => {
    setTextWidth(event.nativeEvent.layout.width);
  };

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  useEffect(() => {
    setIsTextTruncated(textWidth > containerWidth);
  }, [textWidth, containerWidth]);

  const startScrolling = () => {
    if (!isTextTruncated) return;

    setIsScrolling(true);
    const distance = textWidth - containerWidth;
    const duration = (distance / speed) * 1000;

    Animated.timing(scrollX, {
      toValue: -distance,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const stopScrolling = () => {
    setIsScrolling(false);
    Animated.timing(scrollX, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      style={[styles.container, style]}
      onLayout={handleContainerLayout}
      onPressIn={startScrolling}
      onPressOut={stopScrolling}
    >
      <Animated.Text
        numberOfLines={isScrolling ? undefined : 1}
        ellipsizeMode="tail"
        onLayout={handleTextLayout}
        style={[
          styles.text,
          textStyle,
          {
            transform: [{ translateX: scrollX }],
          },
        ]}
      >
        {text}
      </Animated.Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  text: {
    fontSize: 14,
  },
});

export default ScrollingText;
