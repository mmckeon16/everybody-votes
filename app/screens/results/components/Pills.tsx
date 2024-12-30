import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  DemographicKey,
  PillData,
  DemographicPillsProps,
} from '../../../types';

const formatAgeRanges = (ages: number[]): PillData[] => {
  if (!ages || ages.length === 0) return [];
  const sortedAges = [...ages].sort((a, b) => a - b);
  const ranges: PillData[] = [];
  let rangeStart = sortedAges[0];
  let prev = sortedAges[0];

  for (let i = 1; i <= sortedAges.length; i++) {
    const current = sortedAges[i];
    if (current !== prev + 1 || i === sortedAges.length) {
      const displayText =
        prev === rangeStart ? `${rangeStart}` : `${rangeStart}-${prev}`;
      ranges.push({
        category: 'age',
        displayText,
        originalValue: rangeStart, // We store the start of the range as the value
      });
      rangeStart = current;
    }
    prev = current;
  }
  return ranges;
};

const formatValue = (
  category: DemographicKey,
  values: number[] | string[] | undefined
): PillData[] => {
  if (!values || values.length === 0) return [];

  switch (category) {
    case 'age':
      return formatAgeRanges(values as number[]);
    case 'state':
      return (values as string[]).map(value => ({
        category,
        displayText: value,
        originalValue: value,
      }));
    default:
      return (values as string[]).map(value => ({
        category,
        displayText: value
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        originalValue: value,
      }));
  }
};

const DemographicPills: React.FC<DemographicPillsProps> = ({
  data,
  onRemove,
}) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const allPills = (Object.entries(data) as [
    DemographicKey,
    string[] | number[]
  ][]).reduce<PillData[]>((acc, [category, values]) => {
    const formattedValues = formatValue(category, values);
    return [...acc, ...formattedValues];
  }, []);

  return (
    <View>
      <View style={styles.pillsContainer}>
        {allPills.map((pill, index) => (
          <View
            key={`${pill.category}-${pill.originalValue}-${index}`}
            style={styles.pill}
          >
            <Text style={styles.pillText}>{pill.displayText}</Text>
            {onRemove && (
              <TouchableOpacity
                onPress={() => onRemove(pill.category, pill.originalValue)}
                style={styles.removeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  removeButton: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    color: '#666',
    lineHeight: 18,
    marginTop: -2,
  },
});

export default DemographicPills;
