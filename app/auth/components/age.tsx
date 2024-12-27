import React from 'react';
import { View } from 'react-native';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Text } from '~/components/ui/text';
import { StepProps } from '../../types';

const Age: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  return (
    <View className="flex flex-col gap-3">
        <Label nativeID="age"><Text>Age</Text></Label>
      <Input
        id="age"
        placeholder="Age"
        value={profileData?.age}
        onChangeText={(value: string) =>
          setProfileData({ ...profileData, age: value })
        }
        keyboardType="numeric"
      />
    </View>
  );
};

export default Age;
