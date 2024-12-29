import React from 'react';
import { View } from 'react-native';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Text } from '~/components/ui/text';
import { Label } from '~/components/ui/label';
import { StepProps } from '../../types';
import { demographics } from '../constants';

const Demographics: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  return (
    <View className="flex flex-col gap-3">
      <Label nativeID="race">
        <Text>Race/Ethnicity</Text>
      </Label>
      <Select
        id="race"
        className="web:w-full"
        onValueChange={({ value }) => {
          setProfileData({
            ...profileData,
            raceEthnicity: value.toLowerCase(),
          });
        }}
      >
        <SelectTrigger>
          <SelectValue
            className="text-foreground text-sm native:text-lg"
            placeholder="Race/Ethnicity"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>
              <Text>Race/Ethnicity</Text>
            </SelectLabel>
            {demographics.map(demographic => (
              <SelectItem
                label={demographic.label}
                value={demographic.value}
                key={demographic.value}
              />
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};

export default Demographics;
