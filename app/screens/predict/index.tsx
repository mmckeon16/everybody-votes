import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useActiveQuestion } from '../../hooks/useActiveQuestion';
import { usePrediction } from '../../hooks/usePrediction';
import QuestionForm from '../../components/QuestionForm';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Option } from '../../types';
import { useAuth } from '~/app/context/AuthContext';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { predictionAvailability } from '~/lib/prediction-availability';
import { useAccountGuard } from '~/lib/use-account-guard';

export default function Predict() {
  return <ProtectedRoute><PredictionScreen /></ProtectedRoute>;
}

function PredictionScreen() {
  const { data: activeQuestion, isLoading, error, refetch } = useActiveQuestion();
  const { mutateAsync: submitPrediction, isPending } = usePrediction();
  const router = useRouter();
  const { session } = useAuth();
  const { capture } = useAccountGuard(session?.user.id);
  const [now, setNow] = useState(Date.now);
  const endDate = Date.parse(activeQuestion?.end_date ?? '');
  const availability = predictionAvailability(activeQuestion);

  useEffect(() => {
    const remaining = endDate - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(remaining + 1, 2147483647));
    return () => clearTimeout(timer);
  }, [endDate, now]);

  const handleSubmit = async (selectedOption: Option) => {
    if (!session?.user?.id || !selectedOption || !activeQuestion?.id) return;
    const isCurrentAccount = capture();
    if (!isCurrentAccount()) return;
    if (activeQuestion.user_prediction) {
      router.replace('/screens/thanks');
      return;
    }
    // A poll can close after the form appears, including while the app is in the background.
    if (predictionAvailability(activeQuestion) !== 'ready') {
      setNow(Date.now());
      return;
    }
    if (!activeQuestion.user_vote) {
      router.replace('/screens/vote');
      return;
    }
    try {
      await submitPrediction({
        optionId: selectedOption.id,
        userId: session.user.id,
        questionId: activeQuestion.id,
      });
      if (!isCurrentAccount()) return;
      router.push('/screens/thanks');
    } catch {
      // The mutation displays the error; navigation only follows a successful prediction.
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6">
        <Text className="text-xl font-semibold text-center">We could not load this poll.</Text>
        <Text className="text-center">Check your connection and try again.</Text>
        <Button onPress={() => { void refetch(); }}><Text>Try again</Text></Button>
        <Button variant="outline" onPress={() => router.replace('/')}><Text>Go home</Text></Button>
      </View>
    );
  }

  if (activeQuestion?.user_prediction) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6">
        <Text className="text-xl font-semibold text-center">Your prediction is in.</Text>
        <Text className="text-center">You have already made a prediction for this poll.</Text>
        <Button onPress={() => router.replace('/screens/thanks')}><Text>View confirmation</Text></Button>
        <Button variant="outline" onPress={() => router.replace('/')}><Text>Go home</Text></Button>
      </View>
    );
  }

  if (availability !== 'ready') {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6">
        <Text className="text-xl font-semibold text-center">
          {availability === 'ended' ? 'This poll has closed.' : 'No poll is open for predictions right now.'}
        </Text>
        <Text className="text-center">
          {availability === 'ended'
            ? 'Predictions close with the poll. Explore the results, or come back for the next question.'
            : 'Come back for the next question, or explore previous results.'}
        </Text>
        <Button onPress={() => router.replace('/screens/results')}><Text>Explore results</Text></Button>
        <Button variant="outline" onPress={() => router.replace('/')}><Text>Go home</Text></Button>
      </View>
    );
  }

  if (!activeQuestion.user_vote) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6">
        <Text className="text-xl font-semibold text-center">Vote before you predict.</Text>
        <Text className="text-center">Choose your own answer first, then guess what the crowd will choose.</Text>
        <Button onPress={() => router.replace('/screens/vote')}><Text>Cast your vote</Text></Button>
        <Button variant="outline" onPress={() => router.replace('/')}><Text>Go home</Text></Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', padding: 15 }}>
      <QuestionForm
        key={activeQuestion.id}
        question="Which answer do you think will be the most popular?"
        description={activeQuestion.text}
        options={activeQuestion.options}
        onSubmit={handleSubmit}
        disabled={isPending}
        submitText={isPending ? 'Submitting...' : 'Predict'}
      />
    </View>
  );
}
