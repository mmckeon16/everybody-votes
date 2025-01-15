import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ProviderButtonProps } from '../../types';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';

const LoginProviderButton: React.FC<ProviderButtonProps> = ({
  provider,
  providerDisplayName,
  IconComponent = null,
  isSmall = false,
}) => {
  const { colorScheme } = useNativewindColorScheme();
  const [testText, setTestText] = useState(
    JSON.stringify({ 'hey there': 'test here' })
  );

  const clientId = process.env.GOOGLE_CLIENT_ID;
  GoogleSignin.configure({
    webClientId: process.env.GOOGLE_CLIENT_ID,
    // offlineAccess: true,
  });

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

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setTestText(JSON.stringify(userInfo));

      if (userInfo?.data?.idToken) {
        const response = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo?.data?.idToken,
        });
        if (response) {
          setTestText(JSON.stringify(response));
        } else if (error) {
          setTestText(JSON.stringify(error));
        } else {
          setTestText('no error or data found');
        }
        console.log(error, data);
      } else {
        // setTestText('no ID token present!');
        throw new Error('no ID token present!');
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('user cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('operation (e.g. sign in) is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('play services not available or outdated');
      } else {
        console.log('some other error happened during the day');
      }
    }
  };

  const signInWithProvider = async () => {
    try {
      if (provider === 'apple') {
        return signInWithApple();
      } else if (provider === 'google') {
        return signInWithGoogle();
      }
      const redirectUrl = AuthSession.makeRedirectUri({
        path: '/',
      });

      console.log('Starting OAuth with redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: 'com.everybody.polls://index',
        },
      });
      console.log('got this data.url:', data.url);

      if (error) {
        console.log('error in signin with provider: ', error);
        throw error;
      }
      if (Platform.OS !== 'web' && data?.url) {
        await Linking.openURL(data.url);
        // Note: Don't add navigation here as it will be handled by the deep link handler
      } else if (Platform.OS === 'web' && data?.url) {
        // Handle web platform differently if needed
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(`Error signing in with ${providerDisplayName}:`, error);
      Toast.show({
        type: 'error',
        text1: 'Error signing in',
        text2: error,
      });
    }
  };
  return isSmall ? (
    <View className="flex flex-col text-wrap w-20">
      <Text className="text-wrap">{testText}</Text>
      <Text>{clientId}</Text>
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
    </View>
  ) : (
    <>
      <Text className="text-wrap">{testText}</Text>

      <Button
        onPress={provider === 'apple' ? signInWithApple : signInWithProvider}
        className="flex flex-row gap-2 py-2 text-wrap	"
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
    </>
  );
};

export default LoginProviderButton;
