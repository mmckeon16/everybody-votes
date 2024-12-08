import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useGetQuestionHistoryQuery } from '../../store/api/questionsApi';
import { Question } from '../../types';
import QuestionResults from '../../components/QuestionResults';
import ThemedText from '../../components/ThemedText';

export default function Results() {
  const { data: questions, isLoading, error } = useGetQuestionHistoryQuery();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText type="default">Failed to load results</ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Poll Results',
          headerStyle: { backgroundColor: 'black' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {questions?.map((question: Question) => (
          <View key={question.id} style={{ marginBottom: 16 }}>
            <QuestionResults question={question} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
