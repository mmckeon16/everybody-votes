import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import {
  useGetActiveQuestionQuery,
  useSubmitVoteMutation,
} from '../../store/api/questionsApi';
import QuestionForm from '../../components/QuestionForm';
import { Option } from '../../types';

export default function Vote() {
  const { data: activeQuestion, isLoading } = useGetActiveQuestionQuery();
  const [submitVote, { isLoading: isSubmitting }] = useSubmitVoteMutation();

  // TODO handle if activeQuestion is null
  console.log('data: ', activeQuestion);

  const handleSubmit = async (selectedOption: Option) => {
    if (!activeQuestion) return;

    try {
      await submitVote({
        questionId: activeQuestion.id,
        optionId: selectedOption.id,
      }).unwrap();
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
      <Stack.Screen
        options={{
          title: 'Vote',
          headerTitle: 'Everybody votes',
        }}
      />

      {activeQuestion && (
        <QuestionForm
          question={activeQuestion.text}
          options={activeQuestion.options}
          onSubmit={handleSubmit}
          // disabled={isSubmitting}
        />
      )}
    </View>
  );
}
