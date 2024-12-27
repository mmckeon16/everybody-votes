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
import { StepProps } from '../../types';
import { demographics, politicalParties } from '../constants';

const Demographics: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  return (
    <View className="flex flex-col gap-6">
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
            <SelectLabel>Race/Ethnicity</SelectLabel>
            {demographics.map(demographic => (
              <SelectItem
                label={demographic}
                value={demographic}
                key={demographic}
              >
                <Text>{demographic}</Text>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};

export default Demographics;
