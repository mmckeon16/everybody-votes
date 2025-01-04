import React from 'react';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

export const ErrorVoteCard = () => {
  const router = useRouter();

  return (
    <Card className="w-full max-w-sm p-2 rounded-2xl">
      <CardHeader className="items-center">
        <CardTitle className="pb-2">Oops </CardTitle>
        <CardDescription>Something went wrong</CardDescription>
      </CardHeader>
      <CardFooter className="flex-col gap-3 pb-4">
        <Button
          variant="outline"
          className="shadow shadow-foreground/5 flex flex-row gap-2"
          onPress={() => {
            const currentRoute = '/'; // TODO if we use this voting card elsewhere, we should pass this as a prop
            router.replace(currentRoute);
          }}
        >
          <Feather name="refresh-ccw" size={24} color="black" />
          <Text>Refresh</Text>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ErrorVoteCard;
