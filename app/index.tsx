import * as React from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { useGetActiveQuestionQuery } from './store/api/questionsApi';
import { Card, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Text } from '~/components/ui/text';
import { SkeletonCard } from './components/SkeletonCard';
import { useRouter } from 'expo-router';
import {
  getTimeUntilExpiration,
  getTimeRemainingPercentage,
} from './lib/utils';

export default function Screen() {
  const router = useRouter();
  const { data: activeQuestion, isLoading } = useGetActiveQuestionQuery();

  // TODO add loading state
  console.log('activeQuestion: ', activeQuestion);

  return (
    <View className="flex-1 items-center gap-5 p-6 bg-secondary/30">
      {isLoading ? (
        <SkeletonCard />
      ) : (
        <Card className="w-full max-w-sm p-2 rounded-2xl">
          <CardHeader className="items-center">
            <CardTitle className="pb-2 text-center">
              {activeQuestion?.text}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col gap-3 pb-0">
            <Progress
              value={getTimeRemainingPercentage(
                activeQuestion?.startDate,
                activeQuestion?.endDate
              )}
              className="h-2"
              indicatorClassName="bg-sky-600"
            />
            <View className="flex-row items-center overflow-hidden">
              <Text className="text-sm font-bold text-sky-600">
                {getTimeUntilExpiration(activeQuestion?.endDate)}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {' '}
                until this poll closes
              </Text>
            </View>
            <View />
            <Button
              variant="outline"
              className="shadow shadow-foreground/5"
              onPress={() => {
                router.push('/screens/vote');
              }}
            >
              <Text>Vote</Text>
            </Button>
          </CardFooter>
        </Card>
      )}
      <Button
        variant="outline"
        className="shadow shadow-foreground/5"
        onPress={() => {
          router.push('/screens/results');
        }}
      >
        <Text>Results</Text>
      </Button>
    </View>
  );
}
