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
  const [activePartySelect, setActivePartySelect] = useState<'main' | 'other'>(
    'main'
  );
  const [activeLeaningSelect, setActiveLeaningSelect] = useState<
    'main' | 'other'
  >('main');

  const handlePartyChange = (value: string) => {
    // Check if the selected value is in otherPoliticalParties
    const isOtherParty = otherPoliticalParties.some(
      party => party.value === value
    );
    setActivePartySelect(isOtherParty ? 'other' : 'main');
    setProfileData({
      ...profileData,
      politicalParty: value,
    });
  };

  const handleLeaningChange = (value: string) => {
    // Check if the selected value is in otherPoliticalLeanings
    const isOtherLeaning = otherPoliticalLeanings.some(
      leaning => leaning.value === value
    );
    setActiveLeaningSelect(isOtherLeaning ? 'other' : 'main');
    setProfileData({
      ...profileData,
      politicalIdeology: value,
    });
  };

  return (
    <View className="flex flex-col gap-6">
      <View className="flex flex-col gap-3">
        <Label nativeID="party">
          <Text>Political Party</Text>
        </Label>
        {activePartySelect === 'main' ? (
          <>
            <Select
              id="party"
              className="web:w-full"
              onValueChange={({ value }) => handlePartyChange(value)}
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
          </>
        ) : null}

        {(showOtherParties || activePartySelect === 'other') && (
          <View className="flex flex-col gap-3">
            <Select
              id="other-party"
              className="web:w-full"
              onValueChange={({ value }) => handlePartyChange(value)}
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
            {activePartySelect === 'other' && (
              <TouchableOpacity
                className="flex flex-row gap-3 justify-start items-center"
                onPress={() => {
                  setActivePartySelect('main');
                  setShowOtherParties(false);
                }}
              >
                <Text>Show main parties</Text>
                <Entypo name="chevron-thin-up" size={16} color="black" />
              </TouchableOpacity>
            )}
          </View>
        )}
        <Separator />
      </View>

      <View className="flex flex-col gap-3">
        <Label nativeID="leaning">
          <Text>Political Leaning</Text>
        </Label>
        {activeLeaningSelect === 'main' ? (
          <>
            <Select
              id="leaning"
              className="web:w-full"
              onValueChange={({ value }) => handleLeaningChange(value)}
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
          </>
        ) : null}

        {(showOtherLeanings || activeLeaningSelect === 'other') && (
          <View className="flex flex-col gap-3">
            <Select
              id="other-leaning"
              className="web:w-full"
              onValueChange={({ value }) => handleLeaningChange(value)}
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
            {activeLeaningSelect === 'other' && (
              <TouchableOpacity
                className="flex flex-row gap-3 justify-start items-center"
                onPress={() => {
                  setActiveLeaningSelect('main');
                  setShowOtherLeanings(false);
                }}
              >
                <Text>Show main leanings</Text>
                <Entypo name="chevron-thin-up" size={16} color="black" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default Demographics;
