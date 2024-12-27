import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import { StepProps } from '../../types';
import { occupations, incomes } from '../constants';

const SocioEconomic: React.FC<StepProps> = ({
  setProfileData,
  profileData,
}) => {
  return (
    <View className="flex flex-col gap-6">
      <View className="flex flex-col gap-3">
        <Label nativeID="occupation">
          <Text>Occupation</Text>
        </Label>
        <Select
          id="occupation"
          className="web:w-full"
          onValueChange={value => {
            // Remove destructuring
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
              <SelectLabel>Occupation</SelectLabel>
              {occupations.map(({ value, label }) => (
                <SelectItem label={value} value={label} key={label}>
                  {value} {/* Remove Text wrapper */}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="flex flex-col gap-3">
        <Label nativeID="income">
          <Text>Income Bracket</Text>
        </Label>
        <Select
          id="income"
          className="web:w-full"
          onValueChange={value => {
            // Remove destructuring
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
              <SelectLabel>Income Bracket</SelectLabel>
              {incomes.map(({ value, label }) => (
                <SelectItem label={value} value={label} key={label}>
                  {value} {/* Remove Text wrapper */}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
    </View>
  );
};

export default SocioEconomic;
