import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Vote, ChartBar, Target, UserCircle2 } from 'lucide-react-native';

interface OnboardingOverlayProps {
  onSignUpClick: (event: GestureResponderEvent) => void;
}

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

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  onSignUpClick,
}) => {
  const features: FeatureItemProps[] = [
    {
      icon: <Vote className="w-6 h-6 text-blue-500" />,
      title: 'Make your voice heard',
      description:
        'Vote on important topics and see how your views align with others',
    },
    {
      icon: <ChartBar className="w-6 h-6 text-blue-500" />,
      title: 'Explore detailed insights',
      description: 'Filter results by age, location, occupation & more',
    },
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      title: 'Test your prediction skills',
      description: 'Predict majority opinions and track your accuracy',
    },
    {
      icon: <UserCircle2 className="w-6 h-6 text-blue-500" />,
      title: 'Privacy first',
      description: 'Your data is only used for anonymous, aggregated insights',
    },
  ];

  return (
    <View className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
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

          <View className="pt-4">
            <TouchableOpacity
              className="w-full bg-blue-500 active:bg-blue-600 py-4 rounded-lg"
              onPress={onSignUpClick}
            >
              <Text className="text-white font-semibold text-center">
                Sign up & Start voting
              </Text>
            </TouchableOpacity>

            <Text className="text-center text-sm text-gray-500 mt-4">
              Quick sign-up process
            </Text>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default OnboardingOverlay;
