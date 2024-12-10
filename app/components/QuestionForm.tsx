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
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import {
  Card,
  CardFooter,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

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
      <Card className="w-full max-w-sm p-2 rounded-2xl">
        <CardHeader className="items-center">
          <CardTitle className="pb-2 text-center">{question}</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex-column justify-around gap-3">
            {options.map(option => (
              <Button
                key={option.id}
                onPress={() => setSelectedOption(option)}
                className="css-146c3p1 web:scroll-m-20 border-b border-border pb-2 text-3xl text-foreground font-semibold tracking-tight first:mt-0 web:select-text"
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
            <Text>Vote</Text>
          </Button>
        </CardFooter>
      </Card>
    </View>
  );
};

export default QuestionForm;
