import '~/global.css';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { Platform } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { PortalHost } from '@rn-primitives/portal';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import HeaderActions from './components/HeaderActions';
import Toast from '~/components/ui/toast';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem('theme');
      if (Platform.OS === 'web') {
        // Adds the background color to the html element to prevent white background on overscroll.
        document.documentElement.classList.add('bg-background');
      }
      if (!theme) {
        AsyncStorage.setItem('theme', colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light';
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);
        setAndroidNavigationBar(colorTheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      setColorScheme(colorTheme);
      setAndroidNavigationBar(colorTheme);
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                title: 'Everybody polls',
                headerRight: () => <HeaderActions />,
                animation:
                  Platform.OS === 'android' ? 'slide_from_right' : undefined,
                headerRightContainerStyle:
                  Platform.OS === 'android' ? { paddingRight: 8 } : undefined,
              }}
            />
            <Stack.Screen
              name="auth"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/vote/index"
              options={{
                title: 'Everybody polls',
                headerRight: () => <HeaderActions />,
                animation:
                  Platform.OS === 'android' ? 'slide_from_right' : undefined,
                headerRightContainerStyle:
                  Platform.OS === 'android' ? { paddingRight: 8 } : undefined,
              }}
            />
            <Stack.Screen
              name="screens/predict/index"
              options={{
                title: 'Everybody polls',
                headerRight: () => <HeaderActions />,
                animation:
                  Platform.OS === 'android' ? 'slide_from_right' : undefined,
                headerRightContainerStyle:
                  Platform.OS === 'android' ? { paddingRight: 8 } : undefined,
              }}
            />
            <Stack.Screen
              name="screens/results/index"
              options={{
                title: 'Everybody polls',
                headerRight: () => <HeaderActions />,
                animation:
                  Platform.OS === 'android' ? 'slide_from_right' : undefined,
                headerRightContainerStyle:
                  Platform.OS === 'android' ? { paddingRight: 8 } : undefined,
              }}
            />
            <Stack.Screen
              name="screens/thanks"
              options={{
                title: 'Everybody polls',
                headerRight: () => <HeaderActions />,
                animation:
                  Platform.OS === 'android' ? 'slide_from_right' : undefined,
                headerRightContainerStyle:
                  Platform.OS === 'android' ? { paddingRight: 8 } : undefined,
              }}
            />
            <Stack.Screen
              name="auth/complete-profile"
              options={{
                title: 'Everybody polls',
                headerRight: () => <HeaderActions />,
                animation:
                  Platform.OS === 'android' ? 'slide_from_right' : undefined,
                headerRightContainerStyle:
                  Platform.OS === 'android' ? { paddingRight: 8 } : undefined,
              }}
            />
            <Stack.Screen
              name="auth/celebrate"
              options={{
                title: 'Everybody polls',
                headerRight: () => <HeaderActions />,
                animation:
                  Platform.OS === 'android' ? 'slide_from_right' : undefined,
                headerRightContainerStyle:
                  Platform.OS === 'android' ? { paddingRight: 8 } : undefined,
              }}
            />
            <Stack.Screen
              name="screens/splash"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
      <PortalHost />
      <Toast />
    </ThemeProvider>
  );
}
