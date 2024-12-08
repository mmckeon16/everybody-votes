import { Provider } from 'react-redux';
import { store } from './store/store';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="home" options={{ headerShown: false }} />
      </Stack>
    </Provider>
  );
}
