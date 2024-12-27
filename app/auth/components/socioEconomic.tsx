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
import { StepProps } from '../../types';
import { occupations, incomes } from '../constants';

const SocioEconomic: React.FC<StepProps> = ({
  setProfileData,
  profileData,
}) => {
  return (
    <View className="flex flex-col gap-6">
      <Select
        className="web:w-full"
        onValueChange={({ value }) => {
          setProfileData({ ...profileData, occupation: value });
        }}
      >
        <SelectTrigger>
          <SelectValue
            className="text-foreground text-sm native:text-lg"
            placeholder="Occupation"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>
              <Text>Occupation</Text>
            </SelectLabel>
            {occupations.map(({ value, label }) => (
              <SelectItem label={value} value={label} key={label}>
                <Text>{value}</Text>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
        className="web:w-full"
        onValueChange={({ value }) => {
          setProfileData({ ...profileData, incomeBracket: value });
        }}
      >
        <SelectTrigger>
          <SelectValue
            className="text-foreground text-sm native:text-lg"
            placeholder="Income Bracket"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>
              <Text>Income Bracket</Text>
            </SelectLabel>
            {incomes.map(({ value, label }) => (
              <SelectItem label={value} value={label} key={label}>
                <Text>{value}</Text>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};

export default SocioEconomic;
