interface QuestionFormProps {
  question: string;
  description?: string;
  options: Option[];
  onSubmit: (selectedOption: Option) => void;
  submitText?: string;
}

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

  const handleSubmit = (): void => {
    if (selectedOption) {
      onSubmit(selectedOption);
    }
  };

  return (
    <Card className="w-full max-w-sm p-2 rounded-2xl">
      <CardHeader className="items-center">
        <CardTitle className="pb-2 text-center">{question}</CardTitle>
        <CardDescription className="text-base font-semibold">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <View className="flex-column justify-around gap-3">
          {options ? (
            options.map(option => (
              <View key={option.id} className="w-full">
                <Button
                  variant="outline"
                  className={`w-full border-b border-border ${
                    selectedOption?.id === option.id ? 'bg-lightBlue' : ''
                  }`}
                  onPress={() => {
                    setSelectedOption(option);
                  }}
                >
                  <Text
                    className={`text-md font-semibold tracking-tight ${
                      selectedOption?.id === option.id ? 'text-white' : ''
                    }`}
                  >
                    {option.text}
                  </Text>
                </Button>
              </View>
            ))
          ) : (
            <Text>Sorry we can't get the options right now</Text>
          )}
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
  );
};

export default QuestionForm;
