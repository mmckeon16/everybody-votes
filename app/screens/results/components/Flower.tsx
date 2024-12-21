import React, { useRef, useEffect, useState } from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';

interface FlowerProps {
  color: string;
  isBlooming: boolean;
}
const Flower: React.FC<FlowerProps> = ({
  color = 'blue',
  isBlooming = true,
}) => {
  const lottieRef = useRef(null);

  const handleLoad = () => {
    lottieRef.current?.play();
    console.log('lottie ref', lottieRef);

    if (isBlooming) {
      lottieRef.current?.play(315, 375);
    } else {
      lottieRef.current?.play(0, 315);
    }
  };
  return (
    <View className="flex-column items-center overflow-hidden flex-1">
      <LottieView
        ref={lottieRef}
        source={
          color === 'blue'
            ? require('../../../../assets/lottie/light-blue-petals.json')
            : require('../../../../assets/lottie/yellow-petals.json')
        }
        style={{ width: 200, height: 200 }}
        loop={false} // Disable looping to stop after the specified segment
        autoPlay={false} // Disable autoplay to control playback manually
        onAnimationLoaded={() => {
          handleLoad();
        }}
      />
    </View>
  );
};

export default Flower;
