import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import QuestionForm from '../../components/QuestionForm';
import { Option } from '../../types';
import { ProtectedRoute } from '~/app/components/ProtectedRoute';
import { useActiveQuestion } from '../../hooks/useActiveQuestion';
import { useVote } from '../../hooks/useVote';
import { useAuth } from '~/app/context/AuthContext';
import { useAccountGuard } from '~/lib/use-account-guard';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

export default function Vote() {
  const { data: activeQuestion, isLoading, isError, refetch } = useActiveQuestion();
  const { mutateAsync, isPending } = useVote();
  const router = useRouter();
  const { session } = useAuth();
  const { capture } = useAccountGuard(session?.user.id);


  const handleSubmit = async (selectedOption: Option) => {
    if (!session?.user?.id || !selectedOption || !activeQuestion?.id) return;
    const isCurrentAccount = capture();
    if (!isCurrentAccount()) return;

    try {
      await mutateAsync({
        optionId: selectedOption.id || '',
        userId: session?.user?.id || '',
        questionId: activeQuestion.id,
      });

      // A request can finish after logout, deletion, or leaving this screen.
      if (!isCurrentAccount()) return;
      router.push('/screens/predict');
    } catch (error) {
      console.error('Vote submission failed:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <View style={{ flex: 1, alignItems: 'center', padding: 15 }}>
        {isError ? (
          <View className="items-center gap-4 py-8">
            <Text className="text-xl font-semibold">We couldn’t load this poll.</Text>
            <Button onPress={() => void refetch()}><Text>Try again</Text></Button>
          </View>
        ) : !activeQuestion || Date.now() >= new Date(activeQuestion.end_date).getTime() ? (
          <View className="items-center gap-4 py-8">
            <Text className="text-xl font-semibold">No poll is open right now.</Text>
            <Text>Check back soon, or explore previous results from home.</Text>
            <Button onPress={() => router.replace('/')}>
              <Text>Go home</Text>
            </Button>
          </View>
        ) : activeQuestion.user_vote ? (
          <View className="items-center gap-4 py-8">
            <Text className="text-xl font-semibold">Your vote is saved.</Text>
            <Button onPress={() => router.replace(activeQuestion.user_prediction ? '/' : '/screens/predict')}>
              <Text>{activeQuestion.user_prediction ? 'Go home' : 'Make your prediction'}</Text>
            </Button>
          </View>
        ) : (
          <QuestionForm
            key={activeQuestion.id}
            question={activeQuestion.text}
            options={activeQuestion.options}
            onSubmit={function(selectedOption: Option): void {
              handleSubmit(selectedOption);
            }}
            disabled={isPending}
          />
        )}
      </View>
    </ProtectedRoute>
  );
}
