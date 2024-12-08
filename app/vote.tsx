import React from 'react';
import { View } from 'react-native';
import QuestionForm from './components/QuestionForm';
import { Stack } from 'expo-router';

interface Option {
  id: number;
  text: string;
}

export default function Vote() {
  // TODO this is where we can call the api to get the active questions and to submit the answer for a user
  const sampleOptions: Option[] = [
    { id: 1, text: 'Paris' },
    { id: 2, text: 'London' },
    { id: 3, text: 'Rome' },
    { id: 4, text: 'Berlin' },
  ];

  const handleSubmit = (selectedOption: Option | null) => {
    if (selectedOption) {
      console.log('Submitted answer:', selectedOption);
      // Add your submit logic here
    } else {
      console.log('Please select an option');
    }
  };
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        padding: '15px',
      }}
    >
      <Stack.Screen
        options={{
          title: 'Vote',
          headerTitle: 'Everybody votes',
        }}
      />
      <QuestionForm
        question="What is the capital of France?"
        options={sampleOptions}
        onSubmit={handleSubmit}
      />
    </View>
  );
}
