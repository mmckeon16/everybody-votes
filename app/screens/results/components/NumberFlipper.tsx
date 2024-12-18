import React, { useState, useEffect } from 'react';
import { Text } from '~/components/ui/text';

interface NumberFlipperProps {
  targetNumber: number;
}

const NumberFlipper: React.FC<NumberFlipperProps> = ({ targetNumber }) => {
  const [currentNumber, setCurrentNumber] = useState(0);

  useEffect(() => {
    setCurrentNumber(0);

    const duration = 1800; // 3 seconds
    const steps = targetNumber;
    const interval = duration / steps;

    let count = 0;
    const timer = setInterval(() => {
      count++;
      if (count <= targetNumber) {
        setCurrentNumber(count);
      } else {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [targetNumber]);

  return <Text>{currentNumber}</Text>;
};

export default NumberFlipper;
