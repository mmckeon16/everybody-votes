import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useGetQuestionHistoryQuery } from '../../store/api/questionsApi';
import { Question } from '../../types';
import QuestionResults from '../../components/QuestionResults';
import ThemedText from '../../components/ThemedText';
import PieChart from '../../components/PieChart';

export default function Results() {
  // const { data: questions, isLoading, error } = useGetQuestionHistoryQuery();

  //options and percent for each

  // if (isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  // if (error) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ThemedText type="default">Failed to load results</ThemedText>
  //     </View>
  //   );
  // }

  const data = [
    { label: 'Option A', value: 50, color: '#56a5f5' },
    { label: 'Option B', value: 50, color: '#eb8f49' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <PieChart data={data} />
      </ScrollView>
    </View>
  );
}
