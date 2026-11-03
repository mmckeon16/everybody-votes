import { Stack } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import HeaderActions from '../components/HeaderActions';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  return (
    <Stack
      screenOptions={{
        // Account deletion remains available before demographic onboarding is completed.
        headerShown: isAuthenticated,
        title: 'Everybody Polls',
        headerRight: () => <HeaderActions />,
      }}
    />
  );
}
