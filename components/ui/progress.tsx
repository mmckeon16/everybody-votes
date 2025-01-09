import * as ProgressPrimitive from '@rn-primitives/progress';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { cn } from '~/lib/utils';

interface ProgressProps extends ProgressPrimitive.RootProps {
  indicatorClassName?: string;
}

const Progress = React.forwardRef<ProgressPrimitive.RootRef, ProgressProps>(
  ({ className, value, indicatorClassName, ...props }, ref) => {

    // Web implementation
    if (Platform.OS === 'web') {
      return (
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
            className
          )}
          {...props}
        >
          <Indicator value={value} className={indicatorClassName} />
        </ProgressPrimitive.Root>
      );
    }

    // Simple Android implementation
    const normalizedValue = Math.min(Math.max(value ?? 0, 0), 100);

    return (
      <View
        style={{
          width: '100%',
          height: 8,
          backgroundColor: '#E5E7EB',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${normalizedValue}%`,
            backgroundColor: '#3B82F6',
            borderRadius: 4,
          }}
        />
      </View>
    );
  }
);

Progress.displayName = 'Progress';

// Web-only Indicator component
function Indicator({
  value,
  className,
}: {
  value: number | undefined | null;
  className?: string;
}) {
  if (Platform.OS === 'web') {
    return (
      <View
        className={cn(
          'h-full w-full flex-1 bg-primary web:transition-all',
          className
        )}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      >
        <ProgressPrimitive.Indicator
          className={cn('h-full w-full ', className)}
        />
      </View>
    );
  }
  return null;
}

export { Progress };
