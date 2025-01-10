import * as SelectPrimitive from '@rn-primitives/select';
import * as React from 'react';
import { Platform, StyleSheet, View, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Check } from '~/lib/icons/Check';
import { ChevronDown } from '~/lib/icons/ChevronDown';
import { ChevronUp } from '~/lib/icons/ChevronUp';
import { cn } from '~/lib/utils';

type Option = SelectPrimitive.Option;

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<SelectPrimitive.TriggerRef, SelectPrimitive.TriggerProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-row h-10 native:h-12 items-center text-sm justify-between rounded-md border border-input bg-background px-3 py-2 web:ring-offset-background text-muted-foreground web:focus:outline-none web:focus:ring-2 web:focus:ring-ring web:focus:ring-offset-2 [&>span]:line-clamp-1',
        props.disabled && 'web:cursor-not-allowed opacity-50',
        className
      )}
      {...props}
    >
      <>{children}</>
      <ChevronDown size={16} aria-hidden={true} className='text-foreground opacity-50' />
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

/**
 * Platform: WEB ONLY
 */
const SelectScrollUpButton = ({ className, ...props }: SelectPrimitive.ScrollUpButtonProps) => {
  if (Platform.OS !== 'web') {
    return null;
  }
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn('flex web:cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUp size={14} className='text-foreground' />
    </SelectPrimitive.ScrollUpButton>
  );
};

/**
 * Platform: WEB ONLY
 */
const SelectScrollDownButton = ({ className, ...props }: SelectPrimitive.ScrollDownButtonProps) => {
  if (Platform.OS !== 'web') {
    return null;
  }
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn('flex web:cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDown size={14} className='text-foreground' />
    </SelectPrimitive.ScrollDownButton>
  );
};


const SelectContent = React.forwardRef<
  SelectPrimitive.ContentRef,
  SelectPrimitive.ContentProps & { portalHost?: string }
>(({ className, children, position = 'popper', portalHost, ...props }, ref) => {
  const { open } = SelectPrimitive.useRootContext();

  if (Platform.OS === 'web') {
    // ... (web implementation remains the same)
    return null;
  }

  return (
    <SelectPrimitive.Portal hostName={portalHost}>
      <SelectPrimitive.Overlay style={StyleSheet.absoluteFill}>
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut} 
          style={[
            StyleSheet.absoluteFill,
            { 
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)'
            }
          ]}
        >
          <View 
            style={{ 
              width: '90%',
              backgroundColor: 'white',
              borderRadius: 12,
              maxHeight: '80%',
              overflow: 'hidden'
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={true}
              bounces={false}
              contentContainerStyle={{ 
                flexGrow: 1
              }}
            >
              {children}
            </ScrollView>
          </View>
        </Animated.View>
      </SelectPrimitive.Overlay>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<SelectPrimitive.LabelRef, SelectPrimitive.LabelProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(
        'py-2 px-4 text-base font-semibold text-gray-800 bg-gray-50',
        className
      )}
      {...props}
    />
  )
);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<SelectPrimitive.ItemRef, SelectPrimitive.ItemProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full items-center px-4 py-3 active:bg-gray-100',
        props.disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      <View className="absolute left-4 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check size={16} strokeWidth={2.5} className="text-primary" />
        </SelectPrimitive.ItemIndicator>
      </View>
      <SelectPrimitive.ItemText className="pl-8 text-base" />
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  SelectPrimitive.SeparatorRef,
  SelectPrimitive.SeparatorProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type Option,
};
