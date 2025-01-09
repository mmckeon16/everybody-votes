import React from 'react';
import { useRouter } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import {
  CardDescription,
  CardHeader,
  Card,
  CardTitle,
  CardContent,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import FeatureIcon from '../components/FeatureIcon';

const PrivacyScreen = () => {
  const router = useRouter();

  const features = [
    {
      icon: <MaterialIcons name="lock" size={24} className="text-lightBlue" />,
      title: 'Your Privacy Matters',
      description:
        'We never sell or share your personal information. Your demographic details are only used to show voting patterns in aggregate.',
    },
    {
      icon: <Feather name="users" size={24} className="text-lightBlue" />,
      title: 'See How Others Think',
      description:
        'Filter results by age, location, and other demographics to discover fascinating patterns in how different groups vote.',
    },
    {
      icon: <Feather name="pie-chart" size={24} className="text-lightBlue" />,
      title: 'Predict The Majority',
      description:
        'Test your social intuition! Guess how the majority will vote and see how well you can predict group opinions.',
    },
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: '#02245e',
      }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16, // equivalent to p-4
      }}
    >
      <Card className="w-full max-w-sm rounded-2xl">
        <CardHeader>
          <CardTitle>Welcome to Everybody Polls!</CardTitle>

          <CardDescription>
            Before you start voting, we'd love to learn a bit about you to make
            your experience more meaningful.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View className="space-y-6 mb-8">
            {features.map((feature, index) => (
              <FeatureIcon
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </View>

          <Text className="text-sm text-gray-500 mb-6">
            By continuing, you acknowledge that we'll use your demographic
            information only to show voting patterns and trends. We never sell
            or share individual data.
          </Text>

          <Button onPress={() => router.push('/auth/complete-profile')}>
            <Text>Continue to questions</Text>
          </Button>
        </CardContent>
      </Card>
    </ScrollView>
  );
};

export default PrivacyScreen;
