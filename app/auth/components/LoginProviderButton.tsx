import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ProviderButtonProps } from '../../types';
import { useRouter } from 'expo-router';

const LoginProviderButton: React.FC<ProviderButtonProps> = ({
  provider,
  providerDisplayName,
  IconComponent = null,
  isSmall = false,
}) => {
  const { colorScheme } = useNativewindColorScheme();
  const router = useRouter();

  const signInWithProvider = async () => {
    try {
      // Get the root URL for redirect
      let redirectUrl;
      if (__DEV__) {
        // In development (Expo Go), use the exp:// URL for root
        redirectUrl = Linking.createURL('', {
          scheme: 'exp',
        });
      } else {
        // In production, use your app scheme root
        redirectUrl = Linking.createURL('');
      }

      console.log('Redirect URL:', redirectUrl); // This will help debug

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

      console.log('OAuth response:', { data, error });

      if (error) throw error;

      if (Platform.OS !== 'web' && data?.url) {
        await Linking.openURL(data.url);
        const session = await supabase.auth.getSession();
        if (session) {
          router.push('/auth/complete-profile');
        }
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
      onPress={signInWithProvider}
      className="flex flex-row gap-2 min-h-12 py-2"
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
