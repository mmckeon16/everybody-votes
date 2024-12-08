import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  PressableProps,
} from 'react-native';

interface CustomButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'answer' | 'selectedAns' | 'outline' | 'submit';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  disabled = false,
  style,
  onPress,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      styles[size],
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
    ];

    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.secondaryButton];
      case 'answer':
        return [...baseStyle, styles.answerButton];
      case 'submit':
        return [...baseStyle, styles.submitButton];
      case 'selectedAns':
        return [...baseStyle, styles.selectedAnsButton];
      case 'outline':
        return [...baseStyle, styles.outlineButton];
      default:
        return [...baseStyle, styles.primaryButton];
    }
  };

  // type ButtonSize = 'small' | 'medium' | 'large';
  type TextStyleKey = `${ButtonSize}Text`;

  const getTextStyle = () => {
    const baseStyle = [
      styles.text,
      styles[`${size}Text` as TextStyleKey] // Type assertion here
    ];

    switch (variant) {
      case 'outline':
        return [...baseStyle, styles.outlineText];
      case 'secondary':
        return [...baseStyle, styles.secondaryText];
      case 'answer':
          return [...baseStyle, styles.answerText];
      case 'selectedAns':
          return [...baseStyle, styles.selectedAnsText];
      default:
        return [...baseStyle, styles.primaryText];
    }
  };

  return (
    <Pressable
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#007AFF' : 'white'}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 10
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  // Variants
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#6C757D',
  },
  answerButton: {
    backgroundColor: 'white',
  },
  selectedAnsButton: {
    backgroundColor: '#D4DFFF',
  },
  submitButton:{
    backgroundColor:'#001d73',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  // Sizes
  small: {
    height: 32,
    paddingHorizontal: 12,
  },
  medium: {
    height: 40,
    paddingHorizontal: 16,
  },
  large: {
    height: 48,
    paddingHorizontal: 20,
  },
  // Text Styles
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  answerText: {
    color:"black"
  },
  selectedAnsText: {
    color:"black"
  },
  outlineText: {
    color: '#007AFF',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
