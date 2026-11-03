import { useEffect, useRef, useState } from 'react';
import { Modal, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function HeaderActions() {
  const { signOut, deleteAccount, isAuthenticated, session } = useAuth();
  const router = useRouter();
  const actionInFlight = useRef(false);
  const [visible, setVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  function close() {
    if (actionInFlight.current) return;
    setVisible(false);
    setConfirming(false);
    setConfirmation('');
    setError('');
  }

  useEffect(() => {
    // A confirmation belongs to one account, including when another account signs in.
    setVisible(false);
    setConfirming(false);
    setConfirmation('');
    setError('');
  }, [isAuthenticated, session?.user.id]);

  async function perform(action: 'logout' | 'delete') {
    if (actionInFlight.current || (action === 'delete' && confirmation !== 'DELETE')) return;
    actionInFlight.current = true;
    setPending(true);
    setError('');
    try {
      if (action === 'delete') await deleteAccount();
      else await signOut();
      setVisible(false);
      setConfirming(false);
      setConfirmation('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      actionInFlight.current = false;
      setPending(false);
    }
  }

  return (
    <View className={Platform.select({
      ios: 'flex flex-row items-center justify-around gap-2 pl-8 h-12',
      default: 'flex-row items-center justify-center gap-2 pr-5 min-h-12',
    })}>
      <ThemeToggle />
      <Button
        variant="ghost"
        className="h-8 px-2 py-0"
        onPress={() => isAuthenticated ? setVisible(true) : router.push('/auth')}
      >
        <Text className="text-sm leading-none">{isAuthenticated ? 'Account' : 'Login'}</Text>
      </Button>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <View accessibilityViewIsModal className="w-full max-w-sm rounded-2xl bg-background p-6 gap-4">
            <Text className="text-xl font-bold">{confirming ? 'Delete your account?' : 'Your account'}</Text>
            <Text className="text-sm text-muted-foreground">{session?.user.email || 'Your signed-in account'}</Text>
            {confirming ? (
              <>
                <Text>This permanently deletes your account, profile, votes and predictions. This cannot be undone.</Text>
                <Text>Type DELETE to confirm.</Text>
                <Input
                  accessibilityLabel="Account deletion confirmation"
                  placeholder="DELETE"
                  value={confirmation}
                  onChangeText={setConfirmation}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!pending}
                />
                <Button variant="destructive" disabled={pending || confirmation !== 'DELETE'} onPress={() => void perform('delete')}>
                  <Text>{pending ? 'Deleting account…' : 'Permanently delete account'}</Text>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" disabled={pending} onPress={() => void perform('logout')}>
                  <Text>{pending ? 'Signing out…' : 'Log out'}</Text>
                </Button>
                <Button variant="destructive" disabled={pending} onPress={() => setConfirming(true)}>
                  <Text>Delete account</Text>
                </Button>
              </>
            )}
            {!!error && <Text accessibilityRole="alert" className="text-destructive">{error}</Text>}
            <Button variant="ghost" disabled={pending} onPress={close}><Text>Cancel</Text></Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
