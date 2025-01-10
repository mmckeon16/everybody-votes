import React from 'react';
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

  const signInWithApple = async () => {
    try {
      const redirectUrl = Linking.createURL('');
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // Sign in via Supabase Auth.
      if (credential.identityToken) {
        const {
          error,
          data: { user, url },
        } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
          redirectTo: redirectUrl,
        });
        console.log(JSON.stringify({ error, user }, null, 2));
        if (!error) {
          await Linking.openURL(url);
        }
      } else {
        throw new Error('No identityToken.');
      }
    } catch (e) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
  };

  const signInWithProvider = async () => {
    try {
      const redirectUrl = Linking.createURL('');
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
      } else if (Platform.OS === 'web' && data?.url) {
        // Handle web platform differently if needed
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(`Error signing in with ${providerDisplayName}:`, error);
    }
  };
  return isSmall ? (
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
  );
};

export default LoginProviderButton;
