import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type DemographicKey =
  | 'age'
  | 'citizenship'
  | 'employment'
  | 'gender'
  | 'income_bracket'
  | 'political_leaning'
  | 'political_party'
  | 'race_ethnicity'
  | 'state';

interface DemographicData {
  age?: number[];
  citizenship?: string[];
  employment?: string[];
  gender?: string[];
  income_bracket?: string[];
  political_leaning?: string[];
  political_party?: string[];
  race_ethnicity?: string[];
  state?: string[];
}

interface DemographicPillsProps {
  data: DemographicData;
}

const formatAgeRanges = (ages: number[]): string[] => {
  if (!ages || ages.length === 0) return [];

  const sortedAges = [...ages].sort((a, b) => a - b);
  const ranges: string[] = [];
  let rangeStart = sortedAges[0];
  let prev = sortedAges[0];

  for (let i = 1; i <= sortedAges.length; i++) {
    const current = sortedAges[i];
    if (current !== prev + 1 || i === sortedAges.length) {
      ranges.push(
        prev === rangeStart ? `${rangeStart}` : `${rangeStart}-${prev}`
      );
      rangeStart = current;
    }
    prev = current;
  }

  return ranges;
};

const formatValue = (
  key: DemographicKey,
  value: number[] | string[] | undefined
): string[] => {
  if (!value || value.length === 0) return [];

  switch (key) {
    case 'age':
      return formatAgeRanges(value as number[]);
    case 'state':
      return value as string[];
    default:
      return (value as string[]).map(v =>
        v
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      );
  }
};

const DemographicPills: React.FC<DemographicPillsProps> = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const allPills = (Object.entries(data) as [
    DemographicKey,
    string[] | number[]
  ][]).reduce<string[]>((acc, [key, values]) => {
    const formattedValues = formatValue(key, values);
    return [...acc, ...formattedValues];
  }, []);

  return (
    <View>
      <View style={styles.pillsContainer}>
        {allPills.map((value, index) => (
          <View key={index} style={styles.pill}>
            <Text style={styles.pillText}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#E8E8E8',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillText: {
    fontSize: 14,
    color: '#333',
  },
});

export default DemographicPills;

// Usage example:
/*
const demographicData: DemographicData = {
  age: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65],
  citizenship: ['natural-born-citizen'],
  employment: ['retired'],
  gender: ['male'],
  income_bracket: ['under-25k'],
  political_leaning: ['conservative'],
  political_party: ['democrat'],
  race_ethnicity: ['native-american'],
  state: ['AL', 'NJ'],
};

<DemographicPills data={demographicData} />
*/
