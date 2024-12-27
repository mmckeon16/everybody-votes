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
import { politicalParties } from '../constants';

const Demographics: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  return (
    <View className="flex flex-col gap-2">
      <Label nativeID="politics">
        <Text>Political Affiliation</Text>
      </Label>
      <Select
        id="politics"
        className="web:w-full"
        onValueChange={({ value }) => {
          setProfileData({
            ...profileData,
            politicalAffiliation: value.toLowerCase(),
          });
        }}
      >
        <SelectTrigger>
          <SelectValue
            className="text-foreground text-sm native:text-lg"
            placeholder="Political Affiliation"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>
              <Text>Political Affiliation</Text>
            </SelectLabel>
            {politicalParties.map(politicalParty => (
              <SelectItem
                label={politicalParty}
                value={politicalParty}
                key={politicalParty}
              >
                <Text>{politicalParty}</Text>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};

export default Demographics;
