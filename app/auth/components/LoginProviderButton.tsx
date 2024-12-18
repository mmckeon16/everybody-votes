import React from 'react';
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
}) => {
  const { colorScheme } = useNativewindColorScheme();

  const signInWithProvider = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: 'everybody-votes://auth/complete-profile', // replace with your app's scheme
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <Button onPress={signInWithProvider} className="mb-4 flex flex-row gap-2">
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
