import { Stack } from 'expo-router';
import { ThemedText } from './components/ThemedText';

export default function RootLayout() {
  return (
    <Stack>
      <ThemedText type="title">Welcome!</ThemedText>
    </Stack>
  );
}
