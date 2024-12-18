import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import { supabase } from '../lib/supabase';
import LoginProviderButton from './components/LoginProviderButton';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { IconProps } from '../types';

import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

const FacebookIconButton: React.FC<IconProps> = ({ size, color }) => {
  console.log('rendered it');
  return <Fontisto name="facebook" size={size} color={color} />;
};

const AppleIconButton: React.FC<IconProps> = ({ size, color }) => {
  console.log('rendered it');
  return <AntDesign name="apple1" size={size} color={color} />;
};

export default function Login() {
  const { colorScheme } = useNativewindColorScheme();
  const router = useRouter();

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'everybody-votes://auth/complete-profile', // replace with your app's scheme
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signInWithGithub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: 'yourapp://login-callback', // replace with your app's scheme
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <View className="flex items-center justify-center p-4 h-full">
      <Card className="w-full max-w-sm p-2 rounded-2xl">
        <CardHeader className="items-center pb-3">
          <CardTitle className="pb-2 text-center">Log in </CardTitle>
          <CardDescription className="flex flex-row items-center">
            Need and account?
            <Button
              variant="link"
              className="py-0 px-2"
              onPress={() => {
                router.push('/auth/signup');
              }}
            >
              Sign up
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginProviderButton provider="google" providerDisplayName="Google" />
          <LoginProviderButton
            provider="facebook"
            providerDisplayName="Facebook"
          />
          <LoginProviderButton
            provider="twitter"
            providerDisplayName="Twitter"
          />
          <LoginProviderButton
            provider="apple"
            providerDisplayName="Apple"
            IconComponent={AppleIconButton}
          />
          <LoginProviderButton provider="github" providerDisplayName="Github" />
        </CardContent>
      </Card>
    </View>
  );
}
