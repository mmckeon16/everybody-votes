import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Pressable, Platform, View } from 'react-native';
import { TextClassContext } from '~/components/ui/text';
import { cn } from '~/lib/utils';

const buttonVariants = cva(
  'group flex items-center justify-center rounded-md web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary web:hover:opacity-90 active:opacity-90',
        destructive: 'bg-destructive web:hover:opacity-90 active:opacity-90',
        outline:
          'border border-input bg-background web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent',
        secondary: 'bg-secondary web:hover:opacity-80 active:opacity-80',
        ghost: 'web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent',
        link: 'web:underline-offset-4 web:hover:underline web:focus:underline ',
      },
      size: {
        default: Platform.select({
          web: 'h-10 px-4 py-2',
          android: 'min-h-12 px-4', // Remove fixed height, use min-height
          ios: 'h-12 px-5 py-3',
        }),
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8 native:h-14',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  'web:whitespace-nowrap text-sm native:text-base font-medium text-foreground web:transition-colors',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        destructive: 'text-destructive-foreground',
        outline: 'group-active:text-accent-foreground',
        secondary: 'text-secondary-foreground group-active:text-secondary-foreground',
        ghost: 'group-active:text-accent-foreground',
        link: 'text-primary group-active:underline',
      },
      size: {
        default: '',
        sm: '',
        lg: 'native:text-lg',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

  const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
    ({ className, variant, size, onPress, children, style, ...props }, ref) => {
      const layoutClasses = className?.match(/(flex-row|gap-\d+|px-\d+|py-\d+|items-\w+|justify-\w+)/g) || [];
      const pressableClasses = className?.replace(new RegExp(layoutClasses.join('|'), 'g'), '').trim();
      
      return (
        <TextClassContext.Provider
          value={cn(
            props.disabled && 'opacity-50',
            buttonTextVariants({ variant, size })
          )}
        >
          <Pressable
            ref={ref}
            onPress={onPress}
            style={({ pressed }) => [
              style,
              pressed && { opacity: 0.7 },
            ]}
            className={cn(
              props.disabled && 'opacity-50',
              buttonVariants({ variant, size }),
              pressableClasses,
              'active:opacity-70' // Add active state styling
            )}
            android_ripple={{
              color: variant === 'outline' || variant === 'ghost' 
                ? 'rgba(0, 0, 0, 0.1)' 
                : 'rgba(255, 255, 255, 0.2)',
              borderless: false,
              foreground: false // Change to false to ensure ripple appears
            }}
            {...props}
          >
            <View 
              className={cn(
                'flex items-center justify-center flex-row',
                layoutClasses.join(' '),
                'pointer-events-none' // Ensure View doesn't capture touches
              )}
            >
              {children}
            </View>
          </Pressable>
        </TextClassContext.Provider>
      );
    }
  );

Button.displayName = 'Button';

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };