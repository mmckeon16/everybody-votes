import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { DemographicFilters } from '../../../lib/api/results';

interface PillData {
  category: string;
  displayText: string;
  originalValue: string;
}

interface DemographicPillsProps {
  data: DemographicFilters;
  onRemove?: (category: string, originalValue: string) => void;
}

const formatValue = (category: string, values: string[] | undefined): PillData[] => {
  return (values ?? []).map(value => ({
    category,
    displayText: category === 'age' || category === 'state'
      ? value
      : value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    originalValue: value,
  }));
};

const DemographicPills: React.FC<DemographicPillsProps> = ({
  data,
  onRemove,
}) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const allPills = Object.entries(data).reduce<PillData[]>((acc, [category, values]) => {
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
              <Pressable
                onPress={() => onRemove(pill.category, pill.originalValue)}
                style={styles.removeButton}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </Pressable>
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
    justifyContent: 'center',
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
    marginTop: -2,
  },
});

export default DemographicPills;
