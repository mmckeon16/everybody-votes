import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '~/components/ui/text';

function GradientBadge({
  firstColor = '#0879C4',
  secondColor = '#c208c9',
  text,
}) {
  return (
    <LinearGradient
      colors={[firstColor, secondColor]} // light blue to pink
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="px-2.5 py-0.5"
      style={{
        borderRadius: 9999,

        alignSelf: 'flex-start',
      }}
    >
      <Text className="text-white text-sm font-medium">{text}</Text>
    </LinearGradient>
  );
}

export default GradientBadge;
