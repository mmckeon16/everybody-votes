import React, { useRef } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { getTimeUntilExpiration } from '../../lib/utils';
import { useActiveQuestion } from '../../hooks/useActiveQuestion';

export default function Thanks() {
  const router = useRouter();

  const { data: activeQuestion, isLoading } = useActiveQuestion();

  return (
    <View className="flex-col items-center overflow-hidden p-8 h-full bg-blueBg">
      <Card className="w-full max-w-md p-2 rounded-2xl">
        <CardHeader>
          <CardTitle className="pb-2">Thanks for participating! </CardTitle>
          {activeQuestion && (
            <View>
              <CardDescription>
                Come back in {getTimeUntilExpiration(activeQuestion?.end_date)}{' '}
                to see the results{' '}
              </CardDescription>
            </View>
          )}
        </CardHeader>
        <CardContent className="flex-col gap-3">
          <Button
            variant="outline"
            className="shadow shadow-foreground/5"
            onPress={() => {
              router.replace('/');
            }}
          >
            <Text>Go home</Text>
          </Button>
        </CardContent>
      </Card>
    </View>
  );
}
