import * as React from 'react';
import { View, Text } from 'react-native';
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
import { Separator } from '~/components/ui/separator';
import { StepProps } from '../../types';

// Define types for our occupation data
type OccupationSubcategory = {
  label: string;
  value: string;
};

type OccupationCategory = {
  label: string;
  value: string;
  subcategories: OccupationSubcategory[];
};

// type Props = {
//   onSelect?: (value: {
//     categoryValue: string;
//     subcategoryValue?: string;
//     other?: string;
//     displayValue: string;
//   }) => void;
// };

const businessCat = [
  { label: 'Business Owner', value: 'business_owner' },
  { label: 'Franchise Owner', value: 'franchise_owner' },
  { label: 'Startup Founder', value: 'startup_founder' },
  { label: 'Small Business Operator', value: 'small_business_operator' },
  { label: 'Independent Contractor', value: 'independent_contractor' },
];

const occupationCategories: OccupationCategory[] = [
  {
    label: 'Business & Entrepreneurship',
    value: 'business',
    subcategories: [
      { label: 'Business Owner', value: 'business_owner' },
      { label: 'Franchise Owner', value: 'franchise_owner' },
      { label: 'Startup Founder', value: 'startup_founder' },
      { label: 'Small Business Operator', value: 'small_business_operator' },
      { label: 'Independent Contractor', value: 'independent_contractor' },
    ],
  },
  {
    label: 'Entertainment & Performing Arts',
    value: 'entertainment',
    subcategories: [
      { label: 'Actor/Actress', value: 'actor' },
      { label: 'Theater Performer', value: 'theater' },
      { label: 'Voice Actor', value: 'voice_actor' },
      { label: 'Stunt Performer', value: 'stunt' },
      { label: 'TV/Film Production', value: 'tv_film' },
      { label: 'Talent Agent', value: 'talent_agent' },
      { label: 'Casting Professional', value: 'casting' },
    ],
  },
  {
    label: 'Military & Defense',
    value: 'military',
    subcategories: [
      { label: 'Active Duty Military', value: 'active_duty' },
      { label: 'Military Reserve', value: 'reserve' },
      { label: 'Defense Contractor', value: 'defense_contractor' },
      { label: 'Veterans Affairs', value: 'veterans_affairs' },
      { label: 'Military Training', value: 'military_training' },
      { label: 'Military Technology', value: 'military_tech' },
      { label: 'Military Healthcare', value: 'military_healthcare' },
    ],
  },
  {
    label: 'Construction & Trades',
    value: 'construction',
    subcategories: [
      { label: 'General Contracting', value: 'general_contracting' },
      { label: 'Construction Management', value: 'construction_mgmt' },
      { label: 'Carpentry', value: 'carpentry' },
      { label: 'Electrical', value: 'electrical' },
      { label: 'Plumbing', value: 'plumbing' },
      { label: 'HVAC', value: 'hvac' },
      { label: 'Masonry', value: 'masonry' },
    ],
  },
  {
    label: 'Real Estate & Property',
    value: 'real_estate',
    subcategories: [
      { label: 'Real Estate Sales', value: 're_sales' },
      { label: 'Property Management', value: 'property_mgmt' },
      { label: 'Real Estate Development', value: 're_development' },
      { label: 'Commercial Real Estate', value: 'commercial_re' },
      { label: 'Property Appraisal', value: 'appraisal' },
      { label: 'Leasing & Rental', value: 'leasing' },
    ],
  },
  {
    label: 'Technology & IT',
    value: 'tech',
    subcategories: [
      { label: 'Software Development', value: 'software_dev' },
      { label: 'IT Support', value: 'it_support' },
      { label: 'Systems Administration', value: 'sysadmin' },
      { label: 'Data Science & Analytics', value: 'data_science' },
      { label: 'Cybersecurity', value: 'cybersecurity' },
    ],
  },
  {
    label: 'Healthcare & Medicine',
    value: 'healthcare',
    subcategories: [
      { label: 'Medical Practice', value: 'medical' },
      { label: 'Nursing', value: 'nursing' },
      { label: 'Allied Health', value: 'allied_health' },
      { label: 'Mental Health', value: 'mental_health' },
      { label: 'Pharmacy', value: 'pharmacy' },
    ],
  },
  {
    label: 'Education & Training',
    value: 'education',
    subcategories: [
      { label: 'K-12 Education', value: 'k12' },
      { label: 'Higher Education', value: 'higher_ed' },
      { label: 'Professional Training', value: 'prof_training' },
      { label: 'Special Education', value: 'special_ed' },
      { label: 'Educational Administration', value: 'ed_admin' },
    ],
  },
  {
    label: 'Creative & Design',
    value: 'creative',
    subcategories: [
      { label: 'Graphic Design', value: 'graphic_design' },
      { label: 'UX/UI Design', value: 'ux_ui' },
      { label: 'Art & Illustration', value: 'art' },
      { label: 'Writing & Content', value: 'writing' },
      { label: 'Photography', value: 'photography' },
    ],
  },
];

export const OccupationSelect: React.FC<StepProps> = ({
  setProfileData,
  profileData,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedCategoryLabel, setSelectedCategoryLabel] = React.useState('');
  const [selectedSubcategory, setSelectedSubcategory] = React.useState('');
  const [
    selectedSubcategoryLabel,
    setSelectedSubcategoryLabel,
  ] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [otherOccupation, setOtherOccupation] = React.useState('');
  const [filteredCategories, setFilteredCategories] = React.useState<
    OccupationCategory[]
  >(occupationCategories);

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

  const handleValueChange = (rawValue: any) => {
    // Parse the JSON value if it's a string
    console.log('handle changeee', rawValue);
    const value =
      typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;

    if (value.type === 'prefer_not_to_say') {
      setSelectedCategory('prefer_not_to_say');
      setSelectedCategoryLabel('Prefer not to say');
      setSelectedSubcategory('');
      setSelectedSubcategoryLabel('');
      setOtherOccupation('');
      onSelect?.({
        categoryValue: 'prefer_not_to_say',
        displayValue: 'Prefer not to say',
      });
      return;
    }

    if (value.type === 'other') {
      setSelectedCategory('other');
      setSelectedCategoryLabel('Other');
      setSelectedSubcategory('');
      setSelectedSubcategoryLabel('');
      onSelect?.({
        categoryValue: 'other',
        other: otherOccupation,
        displayValue: otherOccupation || 'Other',
      });
      return;
    }

    // Handle category and subcategory selection
    const category = occupationCategories.find(
      cat => cat.value === value.categoryValue
    );
    if (!category) return;

    setSelectedCategory(category.value);
    setSelectedCategoryLabel(category.label);

    const subcategory = category.subcategories.find(
      sub => sub.value === value.subcategoryValue
    );
    if (subcategory) {
      setSelectedSubcategory(subcategory.value);
      setSelectedSubcategoryLabel(subcategory.label);
      onSelect?.({
        categoryValue: category.value,
        subcategoryValue: subcategory.value,
        displayValue: `${category.label} - ${subcategory.label}`,
      });
    }
  };

  return (
    <View className="w-full max-w-md">
      <View className="space-y-4">
        <Select
          className="web:w-full"
          // onValueChange={handleValueChange}
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
            {/* Search Input */}
            <View className="px-3 py-2 border-b border-gray-200">
              <View className="relative">
                <View className="absolute left-2 top-2.5">
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
              <SelectGroup key={category.value}>
                <Separator />
                <SelectLabel>{category.label}</SelectLabel>
                <Separator />
                {category.subcategories.map(subcategory => {
                  return (
                    <View key={`${category.value}-${subcategory.value}`}>
                      <SelectItem
                        label={subcategory.label}
                        value={subcategory.value}
                        className="h-7 bg-blue text-black"
                      >
                        <Text className="text-black flex-1">
                          {subcategory.label}
                        </Text>
                      </SelectItem>
                    </View>
                  );
                })}
              </SelectGroup>
            ))}
            {/* Other Option */}
            <SelectGroup>
              <SelectItem
                label="Other"
                value={JSON.stringify({ type: 'other' })}
              >
                <Text className="text-sm text-gray-900">Other</Text>
              </SelectItem>
              {selectedCategory === 'other' && (
                <View className="px-4 py-2">
                  <TextInput
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter your occupation"
                    value={otherOccupation}
                    onChangeText={setOtherOccupation}
                  />
                </View>
              )}
            </SelectGroup>
            {/* Prefer not to say*/}
            <SelectGroup>
              <SelectItem
                label="Prefer not to say"
                value={JSON.stringify({ type: 'prefer_not_to_say' })}
              >
                <Text className="text-sm text-gray-900">Prefer not to say</Text>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {selectedCategory && selectedCategory !== 'prefer_not_to_say' && (
          <View className="px-2 py-1">
            <Text className="text-sm text-gray-600">
              Selected:{' '}
              {selectedCategory === 'other'
                ? otherOccupation
                : `${selectedCategoryLabel}${
                    selectedSubcategoryLabel
                      ? ` - ${selectedSubcategoryLabel}`
                      : ''
                  }`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default OccupationSelect;
