import React, { useRef, useEffect, useState } from 'react';
import { View } from 'react-native';
import AnimatedLottieView from 'lottie-react-native';

export default function Flower() {
  const animation = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false); //should use useRef here

  // Define your segments
  const segments = {
    falling: [0, 310],
    growing: [310, 375],
  };

  const playSegment = segmentName => {
    if (animation?.current && segments[segmentName]) {
      const segment = segments[segmentName];
      try {
        console.log(`Playing segment: ${segmentName}`, segment);
        animation.current.reset();
        animation.current.play(segment[0], segment[1]);
      } catch (error) {
        console.error('Error playing animation:', error);
      }
    } else {
      console.log('Animation ref not ready');
    }
  };
  return (
    <View className="flex-column items-center overflow-hidden flex-1">
      <AnimatedLottieView
        ref={animation}
        segments={[310, 375]}
        source={require('../../../../assets/lottie/yellow-petals.json')}
        // autoPlay={false} // Keep this false to control segments manually
        // loop={false}
        style={{ width: 200, height: 200 }} // Explicit dimensions
        // resizeMode="cover"
        progress={0}
        onLoadEnd={() => {
          console.log('Animation loaded');
          playSegment('falling');
        }}
      />
    </View>
  );
}
