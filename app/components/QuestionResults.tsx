import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import ThemedText from './ThemedText';
import { Question } from '../types';

interface QuestionResultsProps {
  question: Question;
}

export default function QuestionResults({ question }: QuestionResultsProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="title">{question.text}</ThemedText>
      <ThemedText type="subtitle">
        Total Votes: {question.totalVotes}
      </ThemedText>

      {question.results.map((result) => (
        <View key={result.optionId} style={styles.resultItem}>
          <View style={styles.resultHeader}>
            <ThemedText type="default">{result.text}</ThemedText>
            <ThemedText type="default">
              {result.votes} votes ({result.percentage.toFixed(1)}%)
            </ThemedText>
          </View>

          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[styles.progressBar, { width: `${result.percentage}%` }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultItem: {
    marginTop: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
});
