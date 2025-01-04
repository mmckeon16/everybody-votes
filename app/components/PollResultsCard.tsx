import React from 'react';
import { useRouter } from 'expo-router';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

export const PollResultsCard = () => {
  const router = useRouter();

  return (
    <Card className="w-full max-w-sm p-2 rounded-2xl">
      <CardHeader className="items-center">
        <CardTitle className="pb-2 text-center">
          View previous poll results
        </CardTitle>
        <CardDescription>TODO add question here</CardDescription>
      </CardHeader>
      <CardFooter className="flex-col gap-3 pb-4">
        <Button
          variant="outline"
          className="shadow shadow-foreground/5"
          onPress={() => {
            router.push('/screens/results');
          }}
        >
          <Text>Results</Text>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PollResultsCard;
