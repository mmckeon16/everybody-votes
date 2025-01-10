// OccupationSelect.tsx
import * as React from 'react';
import { View } from 'react-native';
import { Input } from '~/components/ui/input';
import { Search } from 'lucide-react-native';
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
import { StepProps, OccupationCategory } from '../../types';
import { occupationCategories } from '../constants';

export const OccupationSelect: React.FC<StepProps> = ({
  setProfileData,
  profileData,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedCategoryLabel, setSelectedCategoryLabel] = React.useState('');
  const [selectedSubcategoryLabel, setSelectedSubcategoryLabel] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [otherOccupation, setOtherOccupation] = React.useState('');
  const [filteredCategories, setFilteredCategories] = React.useState<OccupationCategory[]>(
    occupationCategories
  );

  React.useEffect(() => {
    if (searchQuery) {
      const filtered = occupationCategories.filter(category => {
        const matchingSubcategories = category.subcategories.filter(sub =>
          sub.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return (
          matchingSubcategories.length > 0 ||
          category.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(occupationCategories);
    }
  }, [searchQuery]);

  return (
    <View className="w-full">
      <Select
        className="web:w-full"
        onValueChange={({ value }) => {
          setProfileData({
            ...profileData,
            occupation: value,
          });
        }}
      >
        <SelectTrigger>
          <SelectValue
            className="text-foreground text-sm native:text-lg"
            placeholder="Select occupation"
          />
        </SelectTrigger>
        <SelectContent className="max-h-96">
          <View className="px-3 py-2 border-b border-gray-200">
            <View className="relative">
              <View className="absolute left-2 top-2.5 z-10">
                <Search size={16} color="#9CA3AF" />
              </View>
              <Input
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md"
                placeholder="Search occupations..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
          
          {filteredCategories.map(category => (
            <View key={category.value} className="mb-2">
              <SelectGroup>
                <View className="bg-gray-50 py-2">
                  <SelectLabel className="text-gray-700">{category.label}</SelectLabel>
                </View>
                <View className="py-1">
                  {category.subcategories.map(subcategory => (
                    <SelectItem
                      key={`${category.value}-${subcategory.value}`}
                      label={subcategory.label}
                      value={subcategory.value}
                      className="min-h-12 px-4 py-2 text-base"
                    />
                  ))}
                </View>
              </SelectGroup>
            </View>
          ))}
          
          <View className="mt-2">
            <SelectGroup>
              <SelectItem 
                label="Other" 
                value="other" 
                className="min-h-12 px-4 py-2 text-base"
              />
            </SelectGroup>
            <SelectGroup>
              <SelectItem 
                label="Prefer not to say" 
                value="prefer_not_to_say" 
                className="min-h-12 px-4 py-2 text-base"
              />
            </SelectGroup>
          </View>
        </SelectContent>
      </Select>

      {selectedCategory && selectedCategory !== 'prefer_not_to_say' && (
        <View className="px-2 py-1 mt-2">
          <Text className="text-sm text-gray-600">
            Selected:{' '}
            {selectedCategory === 'other'
              ? otherOccupation
              : `${selectedCategoryLabel}${
                  selectedSubcategoryLabel ? ` - ${selectedSubcategoryLabel}` : ''
                }`}
          </Text>
        </View>
      )}
    </View>
  );
};

export default OccupationSelect;