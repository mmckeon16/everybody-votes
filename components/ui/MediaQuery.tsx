import React, { useState, useEffect, ReactNode } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

type Orientation = 'portrait' | 'landscape';

interface MediaQueryProps {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  orientation?: Orientation;
  not?: boolean; // New prop to invert the match
  children: ReactNode;
}

interface DimensionsState {
  window: ScaledSize;
  screen: ScaledSize;
}

const MediaQuery: React.FC<MediaQueryProps> = ({
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  orientation,
  not = false, // Default to false for backward compatibility
  children,
}) => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const checkMediaQuery = ({ window }: DimensionsState): void => {
      let result = true;

      // Check width constraints
      if (minWidth !== undefined) {
        result = result && window.width >= minWidth;
      }
      if (maxWidth !== undefined) {
        result = result && window.width <= maxWidth;
      }

      // Check height constraints
      if (minHeight !== undefined) {
        result = result && window.height >= minHeight;
      }
      if (maxHeight !== undefined) {
        result = result && window.height <= maxHeight;
      }

      // Check orientation
      if (orientation !== undefined) {
        const isPortrait = window.height > window.width;
        result =
          result && (orientation === 'portrait' ? isPortrait : !isPortrait);
      }

      // Invert the result if 'not' is true
      setMatches(not ? !result : result);
    };

    // Check initial value
    checkMediaQuery({
      window: Dimensions.get('window'),
      screen: Dimensions.get('screen'),
    });

    // Add event listener for dimension changes
    const subscription = Dimensions.addEventListener('change', checkMediaQuery);

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, [minWidth, maxWidth, minHeight, maxHeight, orientation, not]);

  return matches ? children : null;
};
// Preset breakpoints
export const Breakpoints = {
  xs: { maxWidth: 410 },
  mobile: { maxWidth: 767 },
  tablet: { minWidth: 768, maxWidth: 1024 },
  desktop: { minWidth: 1025 },
} as const;

export default MediaQuery;
