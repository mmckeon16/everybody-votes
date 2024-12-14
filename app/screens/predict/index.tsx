import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useActiveQuestion } from '../../hooks/useActiveQuestion';
import QuestionForm from '../../components/QuestionForm';
import { Option } from '../../types';

export default function Vote() {
  const { data: activeQuestion, isLoading } = useActiveQuestion();
  // const [
  //   submitPrediction,
  //   { isLoading: isSubmitting },
  // ] = useSubmitPredictionMutation();
  const router = useRouter();

  // TODO handle if activeQuestion is null
  console.log('data: ', activeQuestion);

  const handleSubmit = async (selectedOption: Option) => {
    if (!activeQuestion) return;

    try {
      // await submitPrediction({
      //   questionId: activeQuestion.id,
      //   optionId: selectedOption.id,
      // }).unwrap();
      router.push('/screens/thanks');
      // Handle success (e.g., show success message, navigate to results)
    } catch (error) {
      // Handle error
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
          // disabled={isSubmitting}
          submitText="Predict"
        />
      )}
    </View>
  );
}
