import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import QuestionForm from '../../components/QuestionForm';
import { Option } from '../../types';
import { ProtectedRoute } from '~/app/components/ProtectedRoute';
import { useActiveQuestion } from '../../hooks/useActiveQuestion';
import { useVote } from '../../hooks/useVote';
import { useAuth } from '~/app/context/AuthContext';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

export default function Vote() {
  const { data: activeQuestion, isLoading } = useActiveQuestion();
  const { mutateAsync, isPending } = useVote();
  const router = useRouter();
  const { session } = useAuth();


  const handleSubmit = async (selectedOption: Option) => {
    if (!session?.user?.id || !selectedOption || !activeQuestion?.id) return;

    try {
      await mutateAsync({
        optionId: selectedOption.id || '',
        userId: session?.user?.id || '',
        questionId: activeQuestion.id,
      });

      // Only navigate on successful submission
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
        {!activeQuestion ? (
          <View className="items-center gap-4 py-8">
            <Text className="text-xl font-semibold">No poll is open right now.</Text>
            <Text>Check back soon, or explore previous results from home.</Text>
            <Button onPress={() => router.replace('/')}>
              <Text>Go home</Text>
            </Button>
          </View>
        ) : (
          <QuestionForm
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
