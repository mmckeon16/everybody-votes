export default {
  expo: {
    name: 'Everybody Polls',
    slug: 'everybody-polls',
    scheme: 'com.everybody.polls',
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      EXPO_PUBLIC_GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      eas: {
        projectId: '3812e77d-32fd-47d2-98a0-5b3426e1d1d1',
      },
      oneSignalAppId: 'fe9857fe-f9b3-4424-b7d5-ba920dfff980',
    },
    updates: {
      url: 'https://u.expo.dev/3812e77d-32fd-47d2-98a0-5b3426e1d1d1',
    },
    runtimeVersion: '1.0.0',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/every-body-polls-icon.png', // Make sure this file exists
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      bundleIdentifier: 'com.everybody.polls',
      buildNumber: '1.0.0',
      usesAppleSignIn: true,
      config: {
        usesAppleSignIn: true,
      },
    },
    android: {
      package: 'com.everybody.polls',
      adaptiveIcon: {
        foregroundImage: './assets/images/every-body-polls-icon.png',
        backgroundColor: '#ffffff',
      },
      versionCode: 1,
      buildProperties: {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          kotlinVersion: '1.9.25',
        },
      },
      kotlin: {
        suppressKotlinVersionCompatibilityCheck: true, // Add this line
      },
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'com.everybody.polls',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    plugins: [
      [
        'onesignal-expo-plugin',
        {
          mode: process.env.NODE_ENV || 'development',
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            kotlinVersion: '1.9.25',
            suppressKotlinVersionCompatibilityCheck: true, // Add this line
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: '35.0.0',
          },
          ios: {
            deploymentTarget: '15.1',
          },
        },
      ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#232323',
          image: './assets/images/every-body-polls-icon.png',
          dark: {
            image: './assets/images/every-body-polls-icon.png',
            backgroundColor: '#000000',
          },
          imageWidth: 200,
        },
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme:
            'com.googleusercontent.apps.977118953072-nasqa2l0vldnsb4qup28cfmm63holf4d.apps.googleusercontent.com',
        },
      ],
      [
        '@sentry/react-native/expo',
        {
          organization: 'collect-software',
          project: 'everybody-polls',
          // If you are using a self-hosted instance, update the value of the url property
          // to point towards your self-hosted instance. For example, https://self-hosted.example.com/.
          url: 'https://sentry.io/',
          authToken: process.env.SENTRY_AUTH_TOKEN,
        },
      ],
    ],
    hooks: {
      postPublish: [
        {
          file: 'sentry-expo/upload-sourcemaps',
          config: {
            organization: 'collect-software',
            project: 'everybody-polls',
            authToken: process.env.SENTRY_AUTH_TOKEN,
          },
        },
      ],
    },
  },
};
