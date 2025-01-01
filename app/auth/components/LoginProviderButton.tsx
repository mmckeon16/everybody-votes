import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import AntDesign from '@expo/vector-icons/AntDesign';
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

  const signInWithProvider = async () => {
    try {
      console.log(`Starting ${providerDisplayName} OAuth...`);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
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
      console.error(`Error signing in with ${providerDisplayName}:`, error);
    }
  };

  return isSmall ? (
    <Button onPress={signInWithProvider} size="icon">
      {IconComponent ? (
        <IconComponent
          size={24}
          color={colorScheme === 'dark' ? 'black' : 'white'}
        />
      ) : (
        <AntDesign
          name={provider}
          size={24}
          color={colorScheme === 'dark' ? 'black' : 'white'}
        />
      )}
    </Button>
  ) : (
    <Button onPress={signInWithProvider} className="flex flex-row gap-2">
      {IconComponent ? (
        <IconComponent
          size={24}
          color={colorScheme === 'dark' ? 'black' : 'white'}
        />
      ) : (
        <AntDesign
          name={provider}
          size={24}
          color={colorScheme === 'dark' ? 'black' : 'white'}
        />
      )}

      <Text>Sign in with {providerDisplayName}</Text>
    </Button>
  );
};

export default LoginProviderButton;
