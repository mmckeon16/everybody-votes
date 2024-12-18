import React, { useState, useEffect } from 'react';
import { Text } from '~/components/ui/text';

interface NumberFlipperProps {
  targetNumber: number;
}

const NumberFlipper: React.FC<NumberFlipperProps> = ({ targetNumber }) => {
  const [currentNumber, setCurrentNumber] = useState(0);

  useEffect(() => {
    setCurrentNumber(0);

    const duration = 1700; // 3 seconds
    const framesPerSecond = 60;
    const totalFrames = (duration / 1000) * framesPerSecond;
    const incrementPerFrame = targetNumber / totalFrames;

    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      if (frame <= totalFrames) {
        const newValue = Math.min(
          Math.round(incrementPerFrame * frame),
          targetNumber
        );
        setCurrentNumber(newValue);
      } else {
        clearInterval(timer);
      }
    }, 1000 / framesPerSecond);

    return () => clearInterval(timer);
  }, [targetNumber]);

  return <Text>{currentNumber}</Text>;
};

export default NumberFlipper;
