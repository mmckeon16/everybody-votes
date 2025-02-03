import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import * as React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Check } from '~/lib/icons/Check';
import { cn } from '~/lib/utils';

const Checkbox = React.forwardRef<
  CheckboxPrimitive.RootRef,
  CheckboxPrimitive.RootProps & { label?: React.ReactNode }
>(({ className, label, onCheckedChange, checked, ...props }, ref) => {
  const handleToggle = React.useCallback(() => {
    onCheckedChange?.(!checked);
  }, [checked, onCheckedChange]);

  const checkboxContent = (
    <View className="flex-row items-center">
      <CheckboxPrimitive.Root
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          'web:peer h-4 w-4 native:h-[20] native:w-[20] shrink-0 rounded-sm native:rounded border border-primary web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checked && 'bg-primary',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn('items-center justify-center h-full w-full')}
        >
          <Check
            size={12}
            strokeWidth={Platform.OS === 'web' ? 2.5 : 3.5}
            className="text-primary-foreground"
          />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && <View className="ml-2 flex-1">{label}</View>}
    </View>
  );

  if (label) {
    return (
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.7}
        className="py-2 px-1"
      >
        {checkboxContent}
      </TouchableOpacity>
    );
  }

  return checkboxContent;
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
