import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
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
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { Label } from '~/components/ui/label';
import { StepProps } from '../../types';
import {
  states,
  mainCitizenshipStatus,
  otherCitizenshipStatus,
} from '../constants';

const Location: React.FC<StepProps> = ({ setProfileData, profileData }) => {
  const [state, setState] = useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredStates, setFilteredStates] = React.useState<Array>(states);
  const [showOtherStatus, setShowOtherStatus] = useState(false);

  React.useEffect(() => {
    if (searchQuery) {
      const filtered = states.filter((state) => {
        return state.label.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredStates(filtered);
    } else {
      setFilteredStates(states);
    }
  }, [searchQuery]);

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
            console.log('SETTING THE STATE value', value);
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
            {/* Search Input */}
            <View className="px-3 py-2 border-b border-gray-200">
              <View className="relative">
                <View className="absolute left-2 top-2.5">
                  <Search size={16} color="#9CA3AF" />
                </View>
                <Input
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Search states..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
            <SelectGroup>
              <SelectLabel>
                <Text>US State</Text>
              </SelectLabel>
              {filteredStates.map((state) => (
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
              {mainCitizenshipStatus.map((status) => (
                <SelectItem
                  label={status.label}
                  value={status.value}
                  key={status.value}
                />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <TouchableOpacity
          className="flex flex-row gap-3 justify-start items-center"
          onPress={() => setShowOtherStatus(!showOtherStatus)}
        >
          <Text>See more</Text>
          {showOtherStatus ? (
            <Entypo name="chevron-thin-up" size={16} color="black" />
          ) : (
            <Entypo name="chevron-thin-down" size={16} color="black" />
          )}
        </TouchableOpacity>
        {showOtherStatus && (
          <View className="flex flex-col gap-3">
            <Select
              id="party"
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
                  placeholder="Other Statuses"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    <Text>Other Statuses</Text>
                  </SelectLabel>
                  {otherCitizenshipStatus.map((citizenshipStatus) => (
                    <SelectItem
                      label={citizenshipStatus.label}
                      value={citizenshipStatus.value}
                      key={citizenshipStatus.value}
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

export default Location;
