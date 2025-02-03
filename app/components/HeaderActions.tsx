import { View, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function HeaderActions() {
  const { signOut, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    console.log('Sign out button clicked');
    try {
      await signOut();
      console.log('Sign out completed');
    } catch (error) {
      console.error('Error in sign out handler:', error);
    }
  };

  return (
    <View className="flex-row items-center justify-center gap-2 pr-5 min-h-12">
      <ThemeToggle />
      {isAuthenticated ? (
        <Button
          variant="ghost"
          className={Platform.select({
            ios: 'h-8 px-2 py-0',
            default: 'h-8 px-2',
          })}
          onPressIn={handleSignOut}
        >
          <Text className="text-sm leading-none">Logout</Text>
        </Button>
      ) : (
        <Button
          variant="ghost"
          className={Platform.select({
            ios: 'h-8 px-2 py-0',
            default: 'h-8 px-2',
          })}
          onPressIn={() => {
            router.push('/auth');
          }}
        >
          <Text className="text-sm leading-none">Login</Text>
        </Button>
      )}
    </View>
  );
}
