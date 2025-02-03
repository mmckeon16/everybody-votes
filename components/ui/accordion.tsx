// accordion.tsx
import * as AccordionPrimitive from '@rn-primitives/accordion';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  LayoutAnimationConfig,
  LinearTransition,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { ChevronDown } from '~/lib/icons/ChevronDown';
import { cn } from '~/lib/utils';
import { TextClassContext } from '~/components/ui/text';

const Accordion = React.forwardRef<
  AccordionPrimitive.RootRef,
  AccordionPrimitive.RootProps
>(({ children, ...props }, ref) => {
  return (
    <AccordionPrimitive.Root
      ref={ref}
      {...props}
      asChild={Platform.OS !== 'web'}
    >
      <Animated.View
        layout={
          Platform.OS === 'ios' ? undefined : LinearTransition.duration(200)
        }
      >
        {children}
      </Animated.View>
    </AccordionPrimitive.Root>
  );
});

Accordion.displayName = AccordionPrimitive.Root.displayName;

const AccordionItem = React.forwardRef<
  AccordionPrimitive.ItemRef,
  AccordionPrimitive.ItemProps
>(({ className, value, ...props }, ref) => {
  return (
    <Animated.View
      className="overflow-hidden"
      layout={
        Platform.OS === 'ios' ? undefined : LinearTransition.duration(200)
      }
    >
      <AccordionPrimitive.Item
        ref={ref}
        className={cn('border-b border-border', className)}
        value={value}
        {...props}
      />
    </Animated.View>
  );
});

AccordionItem.displayName = AccordionPrimitive.Item.displayName;

const AccordionTrigger = React.forwardRef<
  AccordionPrimitive.TriggerRef,
  AccordionPrimitive.TriggerProps
>(({ className, children, ...props }, ref) => {
  const { isExpanded } = AccordionPrimitive.useItemContext();

  const progress = useDerivedValue(() =>
    isExpanded
      ? withTiming(1, { duration: 200 })
      : withTiming(0, { duration: 200 })
  );

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
    opacity: interpolate(progress.value, [0, 1], [1, 0.8], Extrapolation.CLAMP),
  }));

  return (
    <TextClassContext.Provider value="native:text-lg font-medium web:group-hover:underline">
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger ref={ref} {...props} asChild>
          <Pressable
            className={cn(
              'flex flex-row web:flex-1 items-center justify-between py-4',
              className
            )}
          >
            {children}
            <Animated.View style={chevronStyle}>
              <ChevronDown size={18} className="text-foreground shrink-0" />
            </Animated.View>
          </Pressable>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    </TextClassContext.Provider>
  );
});

AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  AccordionPrimitive.ContentRef,
  AccordionPrimitive.ContentProps
>(({ className, children, ...props }, ref) => {
  const { isExpanded } = AccordionPrimitive.useItemContext();

  if (!isExpanded && Platform.OS === 'ios') {
    return null;
  }

  return (
    <TextClassContext.Provider value="native:text-lg">
      <AccordionPrimitive.Content
        ref={ref}
        className={cn('overflow-hidden text-sm', className)}
        {...props}
      >
        <InnerContent className={cn('pb-4', className)}>
          {children}
        </InnerContent>
      </AccordionPrimitive.Content>
    </TextClassContext.Provider>
  );
});

function InnerContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  if (Platform.OS === 'web') {
    return <View className={cn('pb-4', className)}>{children}</View>;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className={cn('pb-4', className)}
    >
      {children}
    </Animated.View>
  );
}

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
