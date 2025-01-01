export default {
  expo: {
    name: 'Everybody Polls',
    slug: 'everybody-polls',
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: '3812e77d-32fd-47d2-98a0-5b3426e1d1d1',
      },
    },
    splash: {
      image: './assets/test0icon.png', // Make sure this file exists
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    android: {
      package: 'com.everybody.polls',
      adaptiveIcon: {
        foregroundImage: './assets/test0icon.png',
        backgroundColor: '#ffffff',
      },
      versionCode: 1,
      buildProperties: {
        kotlinVersion: '1.9.22',
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
        },
      },
      kotlin: {
        suppressKotlinVersionCompatibilityCheck: true, // Add this line
      },
    },
    plugins: [
      [
        'expo-splash-screen',
        {
          backgroundColor: '#232323',
          image: './assets/test0icon.png',
          dark: {
            image: './assets/test0icon.png',
            backgroundColor: '#000000',
          },
          imageWidth: 200,
        },
      ],
    ],
  },
};
