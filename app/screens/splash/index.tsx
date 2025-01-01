import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Vote, ChartBar, Target, UserCircle2 } from 'lucide-react-native';

const OnboardingOverlay = ({ onSignUpClick }) => {
  return (
    <View className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="text-center">Join the Conversation!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <View className="flex-row space-x-4">
            <Vote className="w-6 h-6 text-blue-500 mt-1" />
            <View className="flex-1">
              <Text className="font-semibold">Make Your Voice Heard</Text>
              <Text className="text-gray-600">
                Vote on important topics and see how your views align with
                others
              </Text>
            </View>
          </View>

          <View className="flex-row space-x-4">
            <ChartBar className="w-6 h-6 text-blue-500 mt-1" />
            <View className="flex-1">
              <Text className="font-semibold">Explore Detailed Insights</Text>
              <Text className="text-gray-600">
                Filter results by age, location, occupation & more
              </Text>
            </View>
          </View>

          <View className="flex-row space-x-4">
            <Target className="w-6 h-6 text-blue-500 mt-1" />
            <View className="flex-1">
              <Text className="font-semibold">Test Your Prediction Skills</Text>
              <Text className="text-gray-600">
                Predict majority opinions and track your accuracy
              </Text>
            </View>
          </View>

          <View className="flex-row space-x-4">
            <UserCircle2 className="w-6 h-6 text-blue-500 mt-1" />
            <View className="flex-1">
              <Text className="font-semibold">Privacy First</Text>
              <Text className="text-gray-600">
                Your data is only used for anonymous, aggregated insights
              </Text>
            </View>
          </View>

          <View className="pt-4">
            <TouchableOpacity
              className="w-full bg-blue-500 active:bg-blue-600 py-4 rounded-lg"
              onPress={onSignUpClick}
            >
              <Text className="text-white font-semibold text-center">
                Sign Up & Start Voting
              </Text>
            </TouchableOpacity>

            <Text className="text-center text-sm text-gray-500 mt-4">
              Quick sign-up process
            </Text>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default OnboardingOverlay;
