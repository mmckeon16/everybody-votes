import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useActiveQuestion } from '../../hooks/useActiveQuestion';
import { usePrediction } from '../../hooks/usePrediction';
import QuestionForm from '../../components/QuestionForm';
import { Option } from '../../types';
import { useAuth } from '~/app/context/AuthContext';

export default function Vote() {
  const { data: activeQuestion, isLoading } = useActiveQuestion();
  const { mutateAsync, isPending } = usePrediction();
  const router = useRouter();
  const { session } = useAuth();

  const handleSubmit = async (selectedOption: Option) => {
    if (!session?.user?.id || !selectedOption) return;

    try {
      await mutateAsync({
        optionId: selectedOption.id,
        userId: session.user.id,
      });
      router.push('/screens/thanks');
    } catch (error) {
      console.error('Error submitting prediction:', error);
      // Handle error (show error message, etc.)
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
          // disabled={isPending}
          submitText="Predict"
        />
      )}
    </View>
  );
}
