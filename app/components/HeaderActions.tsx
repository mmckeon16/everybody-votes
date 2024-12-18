import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function HeaderActions() {
  const { signOut, isAuthenticated } = useAuth();

  return (
    <View className="flex-row items-center gap-2 pr-5">
      <ThemeToggle />
      {isAuthenticated && (
        <Button variant="ghost" className="h-8 px-2" onPress={() => signOut()}>
          <Text className="text-sm">Logout</Text>
        </Button>
      )}
    </View>
  );
}
