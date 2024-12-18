import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase'; // adjust path as needed
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import AntDesign from '@expo/vector-icons/AntDesign';
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '~/components/ui/card';

export default function SignUp() {
  const [error, setError] = useState('');
  const router = useRouter();
  const { colorScheme } = useNativewindColorScheme();

  const signUpWithGoogle = async () => {
    try {
      setError('');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'yourapp://login-callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      router.replace('/auth/complete-profile');
    } catch (err) {
      setError(err.message);
    }
  };

  const signUpWithGithub = async () => {
    try {
      setError('');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: 'yourapp://login-callback',
        },
      });

      if (error) throw error;
      router.replace('/auth/complete-profile');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View className="flex items-center justify-center p-4 h-full">
      <Card className="w-full max-w-sm p-2 rounded-2xl">
        <CardHeader className="items-center pb-3">
          <CardTitle className="pb-2 text-center">Create Account</CardTitle>
          <CardDescription className="flex flex-row items-center">
            Already have an account?{' '}
            <Button
              variant="link"
              className="py-0 px-2"
              onPress={() => {
                router.push('/auth/login');
              }}
            >
              Sign in
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onPress={signUpWithGoogle}
            className="mb-4 flex flex-row gap-2"
          >
            <AntDesign
              name="google"
              size={24}
              color={colorScheme === 'dark' ? 'black' : 'white'}
            />
            <Text>Continue with Google</Text>
          </Button>

          <Button
            onPress={signUpWithGithub}
            className="mb-4 flex flex-row gap-2"
          >
            <AntDesign
              name="github"
              size={24}
              color={colorScheme === 'dark' ? 'black' : 'white'}
            />
            <Text>Continue with GitHub</Text>
          </Button>
        </CardContent>
      </Card>
    </View>
  );
}
