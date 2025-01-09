import React from 'react';
import { View } from 'react-native';
import { CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import FeatureItem from './FeatureIcon';

const OnboardingOverlay = () => {
  const features: FeatureItemProps[] = [
    {
      icon: (
        <MaterialIcons
          name="how-to-vote"
          size={20}
          className="w-6 h-6 text-lightBlue"
        />
      ),
      title: 'Make your voice heard',
      description:
        'Vote on important topics and see how your views align with others',
    },
    {
      icon: (
        <FontAwesome6
          name="chart-bar"
          size={20}
          className="w-6 h-6 text-lightBlue"
        />
      ),
      title: 'Explore detailed insights',
      description: 'Filter results by age, location, occupation & more',
    },
    {
      icon: (
        <Feather name="target" size={20} className="w-6 h-6 text-lightBlue" />
      ),
      title: 'Test your prediction skills',
      description: 'Predict majority opinions and track your accuracy',
    },
    {
      icon: (
        <FontAwesome
          name="user-circle"
          size={20}
          className="w-6 h-6 text-lightBlue"
        />
      ),
      title: 'Privacy first',
      description: 'Your data is only used for anonymous, aggregated insights',
    },
  ];

  return (
    <View className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Join the Conversation!</CardTitle>
      </CardHeader>

      <CardContent className="gap-4">
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
