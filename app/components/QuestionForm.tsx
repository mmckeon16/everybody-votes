// types.ts
interface Option {
  id: number;
  text: string;
}

interface QuestionFormProps {
  question: string;
  options: Option[];
  onSubmit: (selectedOption: Option) => void;
}

// QuestionForm.tsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { CustomButton } from './CustomButton';
import ThemedText from './ThemedText';

export const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  options,
  onSubmit,
}) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const handleSubmit = (): void => {
    if (selectedOption) {
      onSubmit(selectedOption);
    }
  };

  return (
    <View>
      <ThemedText type="title" style={{ paddingBottom: '20px' }}>
        {question}
      </ThemedText>
      <View>
        {options.map(option => (
          <CustomButton
            key={option.id}
            title={option.text}
            variant={
              selectedOption?.id === option.id ? 'selectedAns' : 'answer'
            }
            fullWidth
            onPress={() => setSelectedOption(option)}
          />
        ))}
      </View>
      <CustomButton
        title="Submit answer"
        variant="submit"
        fullWidth
        onPress={handleSubmit}
        disabled={!selectedOption}
        style={{ marginTop: '20px' }}
      />
    </View>
  );
};

export default QuestionForm;
