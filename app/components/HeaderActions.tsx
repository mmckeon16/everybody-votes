import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function HeaderActions() {
  const { signOut, isAuthenticated } = useAuth();

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
    <View className="flex-row items-center gap-2 pr-5">
      <ThemeToggle />
      {isAuthenticated && (
        <Button variant="ghost" className="h-8 px-2" onPress={handleSignOut}>
          <Text className="text-sm">Logout</Text>
        </Button>
      )}
    </View>
  );
}
