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
import { Checkbox } from '~/components/ui/checkbox';
import { StepProps } from '../../types';
import { countries } from '../constants';

const Location: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  const [checkedSameCountry, setCheckedSameCountry] = useState(true);
  const [countryOfOrigin, setCountryOfOrigin] = useState('');

  return (
    <View className="flex flex-col gap-6">
      <Select
        className="web:w-full"
        onValueChange={({ value }) => {
          const lowerCaseVal = value.toLowerCase();
          setCountryOfOrigin(lowerCaseVal);
          if (checkedSameCountry) {
            // then also save
            setProfileData({
              ...profileData,
              countryOrigin: lowerCaseVal,
              countryResidence: lowerCaseVal,
            });
          } else {
            setProfileData({ ...profileData, countryOrigin: lowerCaseVal });
          }
        }}
      >
        <SelectTrigger>
          <SelectValue
            className="text-foreground text-sm native:text-lg"
            placeholder="Country of origin"
          />
          {/* TODO add state if country is USA */}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>
              <Text>Country of origin</Text>
            </SelectLabel>
            {countries.map(country => (
              <SelectItem label={country} value={country} key={country}>
                <Text>{country}</Text>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <View className="flex flex-row gap-4">
        <Checkbox
          id="country"
          checked={checkedSameCountry}
          // if unchecked then unset setProfileData
          onCheckedChange={() => {
            if (checkedSameCountry) {
              // then they are unchecking the box
              setProfileData({ ...profileData, countryResidence: '' });
            } else {
              console.log('checking', profileData);
              setProfileData({
                ...profileData,
                countryResidence: countryOfOrigin,
              });
            }
            setCheckedSameCountry(prev => !prev);
          }}
        />
        <Label nativeID="country">
          <Text>I'm currently living in my country of origin</Text>
        </Label>
      </View>
      {!checkedSameCountry && (
        <Select
          className="web:w-full"
          onValueChange={({ value }) => {
            setProfileData({
              ...profileData,
              countryResidence: value.toLowerCase(),
            });
          }}
        >
          <SelectTrigger>
            <SelectValue
              className="text-foreground text-sm native:text-lg"
              placeholder="Country of Residence"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>
                <Text>Country of Residence</Text>
              </SelectLabel>
              {countries.map(country => (
                <SelectItem label={country} value={country} key={country}>
                  <Text>{country}</Text>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </View>
  );
};

export default Location;
