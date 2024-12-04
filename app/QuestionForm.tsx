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
      <ThemedText type="title" style={{}}>
        {question}
      </ThemedText>
      <View>
        {options.map(option => (
          <Button
            key={option.id}
            title={option.text}
            color={selectedOption?.id === option.id ? 'white' : '#D4DFFF'}
            onPress={() => setSelectedOption(option)}
          />
        ))}
      </View>

      <Button
        title="Submit answer"
        onPress={handleSubmit}
        disabled={!selectedOption}
      />
    </View>
  );
};

export default QuestionForm;
