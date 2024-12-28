import React, { useState } from 'react';
import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectTrigger,
  SelectSeparator,
  SelectValue,
} from '~/components/ui/select';
import { Input } from '~/components/ui/input';

const occupationCategories = {
  business_entrepreneurship: {
    label: 'Business & Entrepreneurship',
    options: [
      { label: 'Business Owner', value: 'biz_owner' },
      { label: 'Franchise Owner', value: 'franchise_owner' },
      { label: 'Startup Founder', value: 'startup_founder' },
      { label: 'Small Business Operator', value: 'small_biz_op' },
      { label: 'Independent Contractor', value: 'ind_contractor' },
    ],
  },
  entertainment_arts: {
    label: 'Entertainment & Performing Arts',
    options: [
      { label: 'Actor/Actress', value: 'actor' },
      { label: 'Theater Performer', value: 'theater' },
      { label: 'Voice Actor', value: 'voice_actor' },
      { label: 'Stunt Performer', value: 'stunt' },
      { label: 'TV/Film Production', value: 'tv_film_prod' },
    ],
  },
  military_defense: {
    label: 'Military & Defense',
    options: [
      { label: 'Active Duty Military', value: 'active_military' },
      { label: 'Military Reserve', value: 'military_reserve' },
      { label: 'Defense Contractor', value: 'defense_contract' },
      { label: 'Veterans Affairs', value: 'vet_affairs' },
      { label: 'Military Training', value: 'military_train' },
    ],
  },
  construction_trades: {
    label: 'Construction & Trades',
    options: [
      { label: 'General Contracting', value: 'gen_contract' },
      { label: 'Construction Management', value: 'const_mgmt' },
      { label: 'Carpentry', value: 'carpentry' },
      { label: 'Electrical', value: 'electrical' },
      { label: 'Plumbing', value: 'plumbing' },
    ],
  },
  real_estate: {
    label: 'Real Estate & Property',
    options: [
      { label: 'Real Estate Sales', value: 're_sales' },
      { label: 'Property Management', value: 'prop_mgmt' },
      { label: 'Real Estate Development', value: 're_dev' },
      { label: 'Commercial Real Estate', value: 'comm_re' },
      { label: 'Property Appraisal', value: 'prop_appraise' },
    ],
  },
  tech_it: {
    label: 'Technology & IT',
    options: [
      { label: 'Software Development', value: 'software_dev' },
      { label: 'IT Support', value: 'it_support' },
      { label: 'Systems Administration', value: 'sys_admin' },
      { label: 'Data Science & Analytics', value: 'data_science' },
      { label: 'Cybersecurity', value: 'cybersec' },
    ],
  },
};

const OccupationSelect = ({ value, onValueChange, error }) => {
  const [otherValue, setOtherValue] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  const handleValueChange = (newValue: string) => {
    if (newValue === 'other') {
      setShowOtherInput(true);
    } else {
      setShowOtherInput(false);
      onValueChange(newValue);
    }
  };

  const handleOtherValueChange = (text: string) => {
    setOtherValue(text);
    if (text) {
      onValueChange(`other_${text.toLowerCase().replace(/\s+/g, '_')}`);
    }
  };

  return (
    <View className="w-full space-y-2">
      <Text className="text-sm font-medium text-foreground">
        Select your occupation
      </Text>

      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select occupation" />
        </SelectTrigger>

        <SelectContent>
          {Object.entries(occupationCategories).map(([key, category]) => (
            <SelectGroup key={key}>
              <SelectLabel>{category.label}</SelectLabel>
              {category.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              <SelectSeparator />
            </SelectGroup>
          ))}

          {/* Additional options group */}
          <SelectGroup>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {showOtherInput && (
        <Input
          value={otherValue}
          onChangeText={handleOtherValueChange}
          placeholder="Enter your occupation"
          className="mt-2"
        />
      )}

      {error && <Text className="text-sm text-destructive">{error}</Text>}
    </View>
  );
};

export default OccupationSelect;
