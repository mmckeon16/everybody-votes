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
import { employmentStatus, incomes } from '../constants';

const Income: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  return (
    <View className="flex flex-col gap-6">
      <View className="flex flex-col gap-3">
        <Label nativeID="income">
          <Text>Income Bracket</Text>
        </Label>
        <Select
          id="income"
          className="web:w-full"
          onValueChange={value => {
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
                <SelectItem label={label} value={value} key={value} />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="flex flex-col gap-3">
        <Label nativeID="employment">
          <Text>Employment Status</Text>
        </Label>
        <Select
          id="employment"
          className="web:w-full"
          onValueChange={value => {
            setProfileData({ ...profileData, employmentStatus: value });
          }}
        >
          <SelectTrigger>
            <SelectValue
              className="text-foreground text-sm native:text-lg"
              placeholder="Employment Statu"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Employment Statu</SelectLabel>
              {employmentStatus.map(({ value, label }) => (
                <SelectItem label={label} value={value} key={value} />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
    </View>
  );
};

export default Income;
