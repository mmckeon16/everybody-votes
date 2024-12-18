import React from 'react';
import { View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import { supabase } from '../lib/supabase';
import LoginProviderButton from './components/LoginProviderButton';
import { IconProps } from '../types';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

const FacebookIconButton: React.FC<IconProps> = ({ size, color }) => {
  return <Fontisto name="facebook" size={size} color={color} />;
};

const AppleIconButton: React.FC<IconProps> = ({ size, color }) => {
  return <AntDesign name="apple1" size={size} color={color} />;
};

export default function Login() {
  const router = useRouter();

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google OAuth...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: Platform.select({
            web: `${window.location.origin}`,
            default: 'everybody-votes://',
          }),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('OAuth response:', { data, error });
      if (error) throw error;

      if (Platform.OS !== 'web' && data?.url) {
        await supabase.auth.getSession();
        router.push('/auth/complete-profile');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <View className="flex items-center justify-center p-4 h-full">
      <Card className="w-full max-w-sm p-2 rounded-2xl">
        <CardHeader className="items-center pb-3">
          <CardTitle className="pb-2 text-center">Log in </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginProviderButton provider="google" providerDisplayName="Google" />
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
    </View>
  );
}
