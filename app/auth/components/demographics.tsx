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
      <Select
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
                {demographic}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
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
            <SelectLabel>Political Affiliation</SelectLabel>
            {politicalParties.map(politicalParty => (
              <SelectItem
                label={politicalParty}
                value={politicalParty}
                key={politicalParty}
              >
                {politicalParty}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
};

export default Demographics;
