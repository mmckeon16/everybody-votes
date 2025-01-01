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
  <View className="flex-row space-x-4">
    <View className="mt-1">{icon}</View>
    <View className="flex-1">
      <Text className="font-semibold">{title}</Text>
      <Text className="text-gray-600">{description}</Text>
    </View>
  </View>
);

export default FeatureItem;
