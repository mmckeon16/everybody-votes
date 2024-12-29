import React, { useState } from 'react';
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
import { states, citizenshipStatus } from '../constants';

const Location: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  const [state, setState] = useState(null);

  return (
    <View className="flex flex-col gap-6">
      <View className="flex flex-col gap-3">
        <Label nativeID="state">
          <Text>State of Residence</Text>
        </Label>
        <Select
          id="state"
          className="web:w-full"
          onValueChange={({ value }) => {
            setState(value);
            setProfileData({ ...profileData, state: value });
          }}
        >
          <SelectTrigger>
            <SelectValue
              className="text-foreground text-sm native:text-lg"
              placeholder="US State"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>
                <Text>US State</Text>
              </SelectLabel>
              {states.map(state => (
                <SelectItem
                  label={state.label}
                  value={state.value}
                  key={state.value}
                />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="flex flex-col gap-3">
        <Label nativeID="citizen">
          <Text>Citizenship Status</Text>
        </Label>
        <Select
          id="citizen"
          className="web:w-full"
          onValueChange={({ value }) => {
            setProfileData({
              ...profileData,
              citizenship: value,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue
              className="text-foreground text-sm native:text-lg"
              placeholder="Citizenship Status"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>
                <Text>Citizenship Status</Text>
              </SelectLabel>
              {citizenshipStatus.map(status => (
                <SelectItem
                  label={status.label}
                  value={status.value}
                  key={status.value}
                />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
    </View>
  );
};

export default Location;
