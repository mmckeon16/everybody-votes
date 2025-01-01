import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Vote, ChartBar, Target, UserCircle2 } from 'lucide-react-native';

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

const OnboardingOverlay = () => {
  const features: FeatureItemProps[] = [
    {
      icon: <Vote className="w-6 h-6 text-lightBlue" />,
      title: 'Make your voice heard',
      description:
        'Vote on important topics and see how your views align with others',
    },
    {
      icon: <ChartBar className="w-6 h-6 text-lightBlue" />,
      title: 'Explore detailed insights',
      description: 'Filter results by age, location, occupation & more',
    },
    {
      icon: <Target className="w-6 h-6 text-lightBlue" />,
      title: 'Test your prediction skills',
      description: 'Predict majority opinions and track your accuracy',
    },
    {
      icon: <UserCircle2 className="w-6 h-6 text-lightBlue" />,
      title: 'Privacy first',
      description: 'Your data is only used for anonymous, aggregated insights',
    },
  ];

  return (
    <View className="w-full max-w-md bg-white">
      <CardHeader>
        <CardTitle className="text-center">Join the Conversation!</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {features.map((feature, index) => (
          <FeatureItem
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </CardContent>
    </View>
  );
};

export default OnboardingOverlay;
