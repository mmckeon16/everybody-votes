import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
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
import { Separator } from '~/components/ui/separator';
import { Label } from '~/components/ui/label';
import { StepProps } from '../../types';
import {
  majorPoliticalParties,
  otherPoliticalParties,
  mainPoliticalLeanings,
  otherPoliticalLeanings,
} from '../constants';

const Demographics: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  const [showOtherParties, setShowOtherParties] = useState(false);
  const [showOtherLeanings, setShowOtherLeanings] = useState(false);

  return (
    <View className="flex flex-col gap-6">
      <View className="flex flex-col gap-3">
        <Label nativeID="party">
          <Text>Political Party</Text>
        </Label>
        <Select
          id="party"
          className="web:w-full"
          onValueChange={({ value }) => {
            setProfileData({
              ...profileData,
              politicalParty: value,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue
              className="text-foreground text-sm native:text-lg"
              placeholder="Political Party"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>
                <Text>Political Party</Text>
              </SelectLabel>
              {majorPoliticalParties.map(politicalParty => (
                <SelectItem
                  label={politicalParty.label}
                  value={politicalParty.value}
                  key={politicalParty.value}
                />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <TouchableOpacity
          className="flex flex-row gap-3 justify-start items-center"
          onPress={() => setShowOtherParties(!showOtherParties)}
        >
          <Text>See more</Text>
          {showOtherParties ? (
            <Entypo name="chevron-thin-up" size={16} color="black" />
          ) : (
            <Entypo name="chevron-thin-down" size={16} color="black" />
          )}
        </TouchableOpacity>
        {showOtherParties && (
          <View className="flex flex-col gap-3">
            <Select
              id="party"
              className="web:w-full"
              onValueChange={({ value }) => {
                setProfileData({
                  ...profileData,
                  politicalParty: value,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue
                  className="text-foreground text-sm native:text-lg"
                  placeholder="Other Parties"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    <Text>Other Parties</Text>
                  </SelectLabel>
                  {otherPoliticalParties.map(politicalParty => (
                    <SelectItem
                      label={politicalParty.label}
                      value={politicalParty.value}
                      key={politicalParty.value}
                    />
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>
        )}
        <Separator />
      </View>

      <View className="flex flex-col gap-3">
        <Label nativeID="party">
          <Text>Political Leaning</Text>
        </Label>
        <Select
          id="party"
          className="web:w-full"
          onValueChange={({ value }) => {
            setProfileData({
              ...profileData,
              politicalIdeology: value,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue
              className="text-foreground text-sm native:text-lg"
              placeholder="Political Leaning"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>
                <Text>Political Leaning</Text>
              </SelectLabel>
              {mainPoliticalLeanings.map(politicalLeaning => (
                <SelectItem
                  label={politicalLeaning.label}
                  value={politicalLeaning.value}
                  key={politicalLeaning.value}
                />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <TouchableOpacity
          className="flex flex-row gap-3 justify-start items-center"
          onPress={() => setShowOtherLeanings(!showOtherLeanings)}
        >
          <Text>See more</Text>
          {showOtherLeanings ? (
            <Entypo name="chevron-thin-up" size={16} color="black" />
          ) : (
            <Entypo name="chevron-thin-down" size={16} color="black" />
          )}
        </TouchableOpacity>
        {showOtherLeanings && (
          <View className="flex flex-col gap-3">
            <Select
              id="leaning"
              className="web:w-full"
              onValueChange={({ value }) => {
                setProfileData({
                  ...profileData,
                  politicalIdeology: value,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue
                  className="text-foreground text-sm native:text-lg"
                  placeholder="Other Political Leanings"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    <Text>Other Political Leanings</Text>
                  </SelectLabel>
                  {otherPoliticalLeanings.map(politicalLeanings => (
                    <SelectItem
                      label={politicalLeanings.label}
                      value={politicalLeanings.value}
                      key={politicalLeanings.value}
                    />
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>
        )}
      </View>
    </View>
  );
};

export default Demographics;
