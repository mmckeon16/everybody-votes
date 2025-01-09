import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import LoginProviderButton from './components/LoginProviderButton';
import OnboardingAd from './components/OnboardingOverlay';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { IconProps } from '../types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';

const FacebookIconButton: React.FC<IconProps> = ({ size, color }) => {
  return <Fontisto name="facebook" size={size} color={color} />;
};

const AppleIconButton: React.FC<IconProps> = ({ size, color }) => {
  return <AntDesign name="apple1" size={size} color={color} />;
};

export default function Login() {
  const router = useRouter();
  const { colorScheme } = useNativewindColorScheme();

  const handleHomePress = () => {
    router.push('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#02245e' }}>
      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16, // equivalent to p-4
        }}
      >
        <Card className="w-full max-w-sm p-2 rounded-2xl">
          <Button size="icon" onPress={handleHomePress}>
            <FontAwesome
              name="home"
              size={18}
              color={colorScheme === 'dark' ? 'black' : 'white'}
            />
          </Button>
          <OnboardingAd />
          <Separator className="mx-5 w-auto" />
          <CardHeader className="items-center pb-3">
            <CardTitle className="pb-2 text-center">Log in </CardTitle>
            <CardDescription>
              To vote on important topics and see how your views align with
              others
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <LoginProviderButton
              provider="google"
              providerDisplayName="Google"
            />
            <LoginProviderButton
              provider="apple"
              providerDisplayName="Apple"
              IconComponent={AppleIconButton}
            />
            <View className="flex flex-row justify-center gap-5">
              <LoginProviderButton
                provider="facebook"
                providerDisplayName="Facebook"
                IconComponent={FacebookIconButton}
                isSmall={true}
              />
              <LoginProviderButton
                provider="twitter"
                providerDisplayName="Twitter"
                isSmall={true}
              />
              <LoginProviderButton
                provider="github"
                providerDisplayName="Github"
                isSmall={true}
              />
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}
