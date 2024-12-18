import React from 'react';
import { View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import AntDesign from '@expo/vector-icons/AntDesign';
import { supabase } from '../lib/supabase';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

export default function Login() {
  const { colorScheme } = useNativewindColorScheme();
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

  const signInWithGithub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: 'everybody-votes://auth/complete-profile',
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
          <Button
            onPress={signInWithGoogle}
            className="mb-4 flex flex-row gap-2"
          >
            <AntDesign
              name="google"
              size={24}
              color={colorScheme === 'dark' ? 'black' : 'white'}
            />
            <Text>Sign in with Google</Text>
          </Button>

          <Button
            onPress={signInWithGithub}
            className="mb-4 flex flex-row gap-2"
          >
            <AntDesign
              name="github"
              size={24}
              color={colorScheme === 'dark' ? 'black' : 'white'}
            />
            <Text>Sign in with GitHub</Text>
          </Button>
        </CardContent>
      </Card>
    </View>
  );
}
