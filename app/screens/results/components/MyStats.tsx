import React, { useRef } from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { Text } from '~/components/ui/text';
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const ppl = require('../../../../assets/lottie/blue-ppl.json');
const unique = require('../../../../assets/lottie/thumbprint.json');
const happy = require('../../../../assets/lottie/celebrate-horn.json');
const sad = require('../../../../assets/lottie/cry.json');

interface MyStatsProps {}

const MyStats: React.FC<MyStatsProps> = ({}) => {
  const votingRef = useRef<LottieView>(null);
  const preditingRef = useRef<LottieView>(null);

  const handleLoad = () => {
    lottieRef.current?.play(25, 125);
  };

  return (
    <View className="flex flex-row gap-3 w-full">
      <Card className="flex-1 max-w-3xl">
        <CardContent className="pt-6">
          <View className="flex flex-row gap-3">
            <View className="flex-1 gap-6">
              <Text className="flex-wrap text-center	">
                You voted with <Text className="text-sky-500">20%</Text> of the
                population
              </Text>
              <View className="flex justify-center items-center">
                {/* <FontAwesome name="group" size={44} color="black" /> */}
                <FontAwesome6 name="person-shelter" size={44} color="black" />
              </View>

              {/* <LottieView
              ref={votingRef}
              source={ppl}
              autoPlay={true}
              loop={false}
              style={{ width: 100, height: 100 }}
              onAnimationLoaded={() => {
                handleLoad();
              }}
            /> */}
            </View>
          </View>
        </CardContent>
      </Card>
      <Card className="max-w-3xl flex-1 ">
        <CardContent className="pt-6">
          <View className="flex flex-row gap-3">
            <View className="flex-1 gap-6">
              <Text className="flex-wrap text-center	">
                You predicted <Text className="text-sky-500">No</Text> would be
                the majority answer
              </Text>
              <View className="flex justify-center items-center">
                <FontAwesome5 name="sad-cry" size={44} color="black" />
                {/* <Ionicons name="happy-outline" size={44} color="black" /> */}
              </View>

              {/* <View className="w-full aspect-video">
              <LottieView
                ref={preditingRef}
                source={happy}
                autoPlay={true}
                loop={false}
                style={{ flex: 1, aspectRatio: 1 }}
              />
            </View> */}
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default MyStats;
