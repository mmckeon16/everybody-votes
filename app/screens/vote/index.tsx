import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import QuestionForm from '../../components/QuestionForm';
import { Option } from '../../types';
import { ProtectedRoute } from '~/app/components/ProtectedRoute';
import { useActiveQuestion } from '../../hooks/useActiveQuestion';
import { useVote } from '../../hooks/useVote';
import { useAuth } from '~/app/context/AuthContext';

export default function Vote() {
  const { data: activeQuestion, isLoading } = useActiveQuestion();
  const { mutateAsync, isPending } = useVote();
  const router = useRouter();
  const { session } = useAuth();

  // TODO handle if activeQuestion is null
  console.log('data: ', activeQuestion);

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
        {activeQuestion && (
          <QuestionForm
            question={activeQuestion.text}
            options={activeQuestion.options}
            onSubmit={function(selectedOption: Option): void {
              handleSubmit(selectedOption);
            }}
            // disabled={isSubmitting}
          />
        )}
      </View>
    </ProtectedRoute>
  );
}
