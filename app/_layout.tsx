import '~/global.css';

import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from '@react-navigation/native';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking';
import { isRunningInExpoGo } from 'expo';
import {
  SplashScreen,
  Stack,
  useNavigationContainerRef,
  useRouter,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PortalHost } from '@rn-primitives/portal';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import Toast from '~/components/ui/toast';
import { HomeButton } from '~/components/ui/HomeButton';
import { AuthProvider } from './context/AuthContext';
import HeaderActions from './components/HeaderActions';
import { Text } from '~/components/ui/text';

// Construct a new integration instance. This is needed to communicate between the integration and React
const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  tracesSampleRate: 1.0, // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing. Adjusting this value in production.
  integrations: [
    // Pass integration
    navigationIntegration,
  ],
  enabled: __DEV__,
  enableNativeFramesTracking: !isRunningInExpoGo(), // Tracks slow and frozen frames in the application
});

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

const RootLayout = () => {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const [isNavigationReady, setIsNavigationReady] = React.useState(false);
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();

  const linking = {
    prefixes: ['everybody-polls://', 'exp://', 'http://localhost:8081'],
    config: {
      initialRouteName: 'index',
      screens: {
        index: '',
        auth: 'auth',
        'screens/vote/index': 'vote',
        'screens/predict/index': 'predict',
        'screens/results/index': 'results',
        'screens/thanks': 'thanks',
        'auth/complete-profile': 'auth/complete-profile',
        'auth/celebrate': 'auth/celebrate',
        'screens/splash': 'splash',
      },
    },
  };

  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (url && isNavigationReady) {
        const parsed = Linking.parse(url);
        console.log('Parsed URL:', parsed);

        const path = parsed.path;
        if (path) {
          try {
            router.push(path);
          } catch (e) {
            console.error('Navigation error:', e);
          }
        }
      }
    };

    const init = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    if (isNavigationReady) {
      init();
    }

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [isNavigationReady, router]);

  // Register navigation container and set ready state
  useEffect(() => {
    if (navigationRef?.current) {
      navigationIntegration.registerNavigationContainer(navigationRef);
      setIsNavigationReady(true);
    }
  }, [navigationRef?.current]);

  useEffect(() => {
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

  const headerRightContainerStyle = undefined;
  // Platform.OS === 'android' ? { paddingRight: 2 } : undefined;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: true,
              }}
              linking={linking}
              ref={navigationRef}
            >
              <Stack.Screen
                name="index"
                options={{
                  title: null,
                  headerBackVisible: false,
                  headerLeft: () => (
                    <Text
                      style={{
                        fontWeight: 700,
                        fontSize: 20,
                      }}
                    >
                      Everybody polls
                    </Text>
                  ),
                  headerRight: () => <HeaderActions />,
                  animation:
                    Platform.OS === 'android' ? 'slide_from_right' : undefined,
                  headerRightContainerStyle: headerRightContainerStyle,
                }}
              />
              <Stack.Screen
                name="auth"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="+not-found"
                options={{
                  title: 'Everybody polls',
                  headerLeft: () => <HomeButton />,
                  animation:
                    Platform.OS === 'android' ? 'slide_from_right' : undefined,
                }}
              />
              <Stack.Screen
                name="screens/vote/index"
                options={{
                  title: 'Everybody polls',
                  headerLeft: () => <HomeButton />,
                  headerRight: () => <HeaderActions />,
                  animation:
                    Platform.OS === 'android' ? 'slide_from_right' : undefined,
                  headerRightContainerStyle: headerRightContainerStyle,
                }}
              />
              <Stack.Screen
                name="screens/predict/index"
                options={{
                  title: 'Everybody polls',
                  headerLeft: () => <HomeButton />,
                  headerRight: () => <HeaderActions />,
                  animation:
                    Platform.OS === 'android' ? 'slide_from_right' : undefined,
                  headerRightContainerStyle: headerRightContainerStyle,
                }}
              />
              <Stack.Screen
                name="screens/results/index"
                options={{
                  title: 'Everybody polls',
                  headerLeft: () => <HomeButton />,
                  headerRight: () => <HeaderActions />,
                  animation:
                    Platform.OS === 'android' ? 'slide_from_right' : undefined,
                  headerRightContainerStyle: headerRightContainerStyle,
                }}
              />
              <Stack.Screen
                name="screens/thanks"
                options={{
                  title: 'Everybody polls',
                  headerLeft: () => <HomeButton />,
                  headerRight: () => <HeaderActions />,
                  animation:
                    Platform.OS === 'android' ? 'slide_from_right' : undefined,
                  headerRightContainerStyle: headerRightContainerStyle,
                }}
              />
              <Stack.Screen
                name="auth/complete-profile"
                options={{
                  title: 'Everybody polls',
                  headerRight: () => <HeaderActions />,
                  animation:
                    Platform.OS === 'android' ? 'slide_from_right' : undefined,
                  headerRightContainerStyle: headerRightContainerStyle,
                }}
              />
              <Stack.Screen
                name="auth/celebrate"
                options={{
                  title: 'Everybody polls',
                  headerLeft: () => <HomeButton />,
                  headerRight: () => <HeaderActions />,
                  animation:
                    Platform.OS === 'android' ? 'slide_from_right' : undefined,
                  headerRightContainerStyle: headerRightContainerStyle,
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
    </GestureHandlerRootView>
  );
};

export default RootLayout; //Sentry.wrap(RootLayout);
