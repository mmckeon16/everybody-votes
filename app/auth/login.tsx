import React from 'react';
import { View } from 'react-native';
import { supabase } from '../lib/supabase'; // adjust path as needed
import { Button } from '~/components/ui/button'; // adjust path as needed

export default function Login() {
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'yourapp://login-callback', // replace with your app's scheme
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
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Button onPress={signInWithGoogle} className="mb-4">
        Sign in with Google
      </Button>

      <Button onPress={signInWithGithub}>Sign in with GitHub</Button>
    </View>
  );
}
