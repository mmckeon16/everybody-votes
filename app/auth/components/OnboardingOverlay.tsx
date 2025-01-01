import React from 'react';
import { View } from 'react-native';
import { CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Vote, ChartBar, Target, UserCircle2 } from 'lucide-react-native';
import FeatureItem from './FeatureIcon';

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
