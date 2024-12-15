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

const Gender: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  return (
    <View>
      <Select
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
            <SelectLabel>Gender</SelectLabel>
            <SelectItem label="Male" value="male">
              Male
            </SelectItem>
            <SelectItem label="Female" value="female">
              Female
            </SelectItem>
            <SelectItem label="Non-binary" value="non-binary">
              Non-binary
            </SelectItem>
            <SelectItem label="Prefer not to say" value="prefer-not-to-say">
              Prefer not to say
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};

export default Gender;
