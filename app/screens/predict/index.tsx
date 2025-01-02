import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useActiveQuestion } from '../../hooks/useActiveQuestion';
import { usePrediction } from '../../hooks/usePrediction';
import QuestionForm from '../../components/QuestionForm';
import { Option } from '../../types';
import { useAuth } from '~/app/context/AuthContext';

export default function Predict() {
  const { data: activeQuestion, isLoading } = useActiveQuestion();
  const { mutateAsync: submitPrediction, isPending } = usePrediction();
  const router = useRouter();
  const { session } = useAuth();

  const handleSubmit = async (selectedOption: Option) => {
    if (!session?.user?.id || !selectedOption || !activeQuestion?.id) return;

    try {
      await submitPrediction({
        optionId: selectedOption.id,
        userId: session.user.id,
        questionId: activeQuestion.id,
      });
      router.push('/screens/thanks');
    } catch (error) {
      // Error is handled by the mutation
      // Only redirect on success
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
    <View style={{ flex: 1, alignItems: 'center', padding: 15 }}>
      {activeQuestion && (
        <QuestionForm
          question="Which answer do you think will be the most popular?"
          description={activeQuestion.text}
          options={activeQuestion.options}
          onSubmit={handleSubmit}
          disabled={isPending}
          submitText={isPending ? 'Submitting...' : 'Predict'}
        />
      )}
    </View>
  );
}
