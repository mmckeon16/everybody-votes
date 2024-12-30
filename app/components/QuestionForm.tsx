interface QuestionFormProps {
  question: string;
  description?: string;
  options: Option[];
  onSubmit: (selectedOption: Option) => void;
  submitText?: string;
}

// QuestionForm.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import {
  Card,
  CardFooter,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card';
import { Option } from '../types';

export const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  options,
  onSubmit,
  submitText = 'Vote',
  description = '',
}) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  console.log(options);
  const handleSubmit = (): void => {
    if (selectedOption) {
      onSubmit(selectedOption);
    }
  };

  return (
    <View>
      <Card className="w-full max-w-sm p-2 rounded-2xl">
        <CardHeader className="items-center">
          <CardTitle className="pb-2 text-center">{question}</CardTitle>
          <CardDescription className="text-base font-semibold">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View className="flex-column justify-around gap-3">
            {options.map(option => (
              <Button
                key={option.id}
                onPress={() => setSelectedOption(option)}
                className={`border-b border-border pb-2 text-3xl font-semibold tracking-tight first:mt-0 web:select-text
                ${
                  selectedOption?.id === option.id
                    ? 'bg-sky-600	text-gray-700'
                    : 'text-foreground'
                }`}
              >
                <Text>{option.text}</Text>
              </Button>
            ))}
          </View>
        </CardContent>
        <CardFooter className="flex-col gap-3 pb-0">
          <Button
            variant="outline"
            className="shadow shadow-foreground/5"
            onPress={handleSubmit}
            disabled={!selectedOption}
          >
            <Text>{submitText}</Text>
          </Button>
        </CardFooter>
      </Card>
    </View>
  );
};

export default QuestionForm;
