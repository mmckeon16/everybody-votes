import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Users, Filter, TrendingUp, Award } from 'lucide-react-native';
// import { LineChart, Line } from 'recharts';

const FeatureCard = ({ Icon, title, description }) => (
  <View className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
    <View className="flex flex-row items-center mb-2">
      <Icon size={24} color="#fff" style={{ marginRight: 12 }} />
      <Text className="text-lg font-semibold text-white">{title}</Text>
    </View>
    <Text className="text-white/90 text-base">{description}</Text>
  </View>
);

const PollAd = () => {
  const sampleData = Array(24)
    .fill()
    .map((_, i) => ({
      value: Math.sin(i / 3) * 30 + Math.cos(i / 6) * 20 + 50,
      secondary: Math.cos(i / 4) * 25 + 60,
    }));

  return (
    <View className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 min-h-screen">
      <View className="items-center mb-8">
        <Text className="text-3xl font-bold text-white mb-2">
          Everybody Polls
        </Text>
        <Text className="text-lg text-white/90">
          Where Your Opinion Shapes the Conversation
        </Text>
      </View>

      <View className="space-y-4">
        <FeatureCard
          Icon={Users}
          title="Join Daily Polls"
          description="Voice your opinion on trending topics and see how you compare to others"
        />

        <FeatureCard
          Icon={Filter}
          title="Deep Insights"
          description="Filter results by age, location, and more to discover unique demographic patterns"
        />

        <FeatureCard
          Icon={TrendingUp}
          title="Predict & Win"
          description="Test your intuition by predicting majority opinions and track your accuracy"
        />

        <FeatureCard
          Icon={Award}
          title="Earn Points"
          description="Build your reputation as a top predictor"
        />
      </View>

      {/* <View className="mt-6 bg-white/5 rounded-lg p-4 backdrop-blur-sm">
        <LineChart 
          width={320} 
          height={100} 
          data={sampleData} 
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          className="w-full"
        >
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#fff" 
            strokeWidth={2} 
            dot={false} 
          />
          <Line 
            type="monotone" 
            dataKey="secondary" 
            stroke="rgba(255,255,255,0.5)" 
            strokeWidth={1.5} 
            dot={false} 
          />
        </LineChart>
      </View> */}

      <Pressable
        className="bg-white mt-6 py-4 px-8 rounded-full items-center active:opacity-80"
        hoverStyle={{ opacity: 0.9 }}
      >
        <Text className="text-blue-600 text-lg font-bold">Signup now</Text>
      </Pressable>
    </View>
  );
};

export default PollAd;
