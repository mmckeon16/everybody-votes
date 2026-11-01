import React, { useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ProviderButtonProps } from '../../types';

const LoginProviderButton: React.FC<ProviderButtonProps> = ({
  provider,
  providerDisplayName,
  IconComponent = null,
  isSmall = false,
}) => {
  const { colorScheme } = useNativewindColorScheme();
  const [errorMsg, setErrorMsg] = useState('');

  const signInWithApple = async () => {
    try {
      // First, check if Apple Auth is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple authentication is not available on this device');
      }

      // Request native Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // Sign in with Supabase using the Apple ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      console.log('Supabase sign in successful:', {
        user: data.user?.id,
        session: data.session?.access_token ? 'Present' : 'Missing',
      });
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';

      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ERR_REQUEST_CANCELED'
      ) {
        errorMessage = 'Sign-in was cancelled';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error('Apple sign-in error:', error);
      setErrorMsg(errorMessage);
    }
  };

  const signInWithProvider = async () => {
    try {
      const redirectUrl =
        Platform.OS === 'web'
          ? typeof window !== 'undefined'
            ? window.location.origin
            : 'https://everybodypolls.com'
          : 'com.everybody.polls://index';
      console.log('Starting OAuth with redirect URL:', redirectUrl);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      if (Platform.OS !== 'web' && data?.url) {
        await Linking.openURL(data.url);
        // Note: Don't add navigation here as it will be handled by the deep link handler
      } else if (
        Platform.OS === 'web' &&
        typeof window !== 'undefined' &&
        data?.url
      ) {
        // Handle web platform differently if needed
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(`Error signing in with ${providerDisplayName}:`, error);
    }
  };
  return (
    <>
      {errorMsg}
      {isSmall ? (
        <Button onPress={signInWithProvider} size="icon">
          {IconComponent ? (
            <IconComponent
              size={20}
              color={colorScheme === 'dark' ? 'black' : 'white'}
            />
          ) : (
            <AntDesign
              name={provider}
              size={20}
              color={colorScheme === 'dark' ? 'black' : 'white'}
            />
          )}
        </Button>
      ) : (
        <Button
          onPress={provider === 'apple' ? signInWithApple : signInWithProvider}
          className="flex flex-row gap-2 py-2"
        >
          {IconComponent ? (
            <IconComponent
              size={20}
              color={colorScheme === 'dark' ? 'black' : 'white'}
            />
          ) : (
            <AntDesign
              name={provider}
              size={20}
              color={colorScheme === 'dark' ? 'black' : 'white'}
            />
          )}

          <Text>Sign in with {providerDisplayName}</Text>
        </Button>
      )}
    </>
  );
};

export default LoginProviderButton;
