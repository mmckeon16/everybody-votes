import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
}) => (
  <View className="flex-row gap-4">
    <View>{icon}</View>
    <View className="flex-1">
      <Text className="font-semibold">{title}</Text>
      <Text className="text-description" tailwind>
        {description}
      </Text>
    </View>
  </View>
);

export default FeatureItem;
