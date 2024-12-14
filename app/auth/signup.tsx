import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase'; // adjust path as needed
import ThemedText from '../components/ThemedText';
import { Button } from '~/components/ui/button'; // adjust path if needed
import { Github, Mail } from 'lucide-react-native'; // assuming you're using lucide icons

export default function SignUp() {
  const [error, setError] = useState('');
  const router = useRouter();

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
    } catch (err: any) {
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
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Create Account
      </ThemedText>

      {error && (
        <ThemedText type="error" style={styles.error}>
          {error}
        </ThemedText>
      )}

      <Button
        onPress={signUpWithGoogle}
        className="mb-4 flex-row items-center justify-center space-x-2"
      >
        <Mail size={20} />
        <ThemedText type="button">Continue with Google</ThemedText>
      </Button>

      <Button
        onPress={signUpWithGithub}
        className="mb-4 flex-row items-center justify-center space-x-2"
        variant="outline"
      >
        <Github size={20} />
        <ThemedText type="button">Continue with GitHub</ThemedText>
      </Button>

      <Link href="/auth/login" asChild>
        <TouchableOpacity style={styles.linkButton}>
          <ThemedText type="link">Already have an account? Sign in</ThemedText>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  error: {
    marginBottom: 20,
    textAlign: 'center',
  },
});
