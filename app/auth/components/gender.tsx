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
            <SelectItem label="Male" value="male">
              <Text>Male</Text>
            </SelectItem>
            <SelectItem label="Female" value="female">
              <Text>Female</Text>
            </SelectItem>
            <SelectItem label="Non-binary" value="non-binary">
              <Text>Non-binary</Text>
            </SelectItem>
            <SelectItem label="Prefer not to say" value="prefer-not-to-say">
              <Text>Prefer not to say</Text>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};

export default Gender;
