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
import { genders } from '../constants';

const Gender: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  return (
    <View className="flex flex-col gap-3">
      <Label nativeID="gender">
        <Text>Gender</Text>
      </Label>
      <Select
        id="gender"
        className="web:w-full"
        onValueChange={({ value }) =>
          setProfileData({ ...profileData, gender: value })
        }
      >
        <SelectTrigger>
          <SelectValue
            className="text-foreground text-sm native:text-lg"
            placeholder="Select gender"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>
              <Text>Gender</Text>
            </SelectLabel>
            {genders.map(gender => (
              <SelectItem
                label={gender.label}
                value={gender.value}
                key={gender.value}
              />
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};

export default Gender;
