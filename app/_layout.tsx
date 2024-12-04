import { Stack } from "expo-router";
import { ThemedText } from './ThemedText';


export default function RootLayout() {
  return (
    <Stack >
      <ThemedText type="title">Welcome!</ThemedText>
    </Stack>
    );
}
