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
    android: {
      package: 'com.everybody.polls',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      versionCode: 1,
    },
  },
};
