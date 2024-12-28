import React from 'react';
import { View } from 'react-native';
import OccupationSelect from './OccupationSelect';

import { Text } from '~/components/ui/text';
import { Label } from '~/components/ui/label';
import { StepProps } from '../../types';

const Occupation: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  return (
    <View className="flex flex-col gap-3">
      <Label nativeID="occupation">
        <Text>Occupation</Text>
      </Label>

      <OccupationSelect
        id="occupation"
        value={profileData.occupation}
        onSelect={({ value }) => {
          setProfileData({
            ...profileData,
            occupation: value,
          });
        }}
        // error={/* optional error message */}
      />
    </View>
  );
};

export default Occupation;
