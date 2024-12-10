import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import QuestionForm from '../../components/QuestionForm';
import { Option } from '../../types';
import { ProtectedRoute } from '~/app/components/ProtectedRoute';
import { useActiveQuestion } from '../../hooks/useActiveQuestion';
// import { useVote } from '../../hooks/useVote';

export default function Vote() {
  const { data: activeQuestion, isLoading } = useActiveQuestion();
  // const { mutate: submitVote, isPending: isSubmitting } = useVote();

  const handleSubmit = async (selectedOption: Option) => {
    if (!activeQuestion) return;

    try {
      // await submitVote({
      //   questionId: activeQuestion.id,
      //   optionId: selectedOption.id,
      // });
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
    // <ProtectedRoute>
    <View style={{ flex: 1, alignItems: 'center', padding: 15 }}>
      {activeQuestion && (
        <QuestionForm
          question={activeQuestion.text}
          options={activeQuestion.options}
          onSubmit={function (selectedOption: Option): void {
            throw new Error('Function not implemented.');
          }} // onSubmit={handleSubmit}
          // disabled={isSubmitting}
        />
      )}
    </View>
    // </ProtectedRoute>
  );
}
