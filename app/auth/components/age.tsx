import React from 'react';
import { View } from 'react-native';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button'; // adjust path as needed
import { ProfileData, StepProps } from '../../types';

const Age: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  return (
    <View>
      <Input
        placeholder="Age"
        value={profileData?.age}
        onChangeText={(value: string) =>
          setProfileData({ ...profileData, age: value })
        }
        aria-labelledby="inputLabel"
        aria-errormessage="inputError"
        keyboardType="numeric"
      />
    </View>
  );
};

export default Age;
