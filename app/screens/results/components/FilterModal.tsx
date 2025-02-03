import React, { useState } from 'react';
import { Modal, ScrollView, View, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useColorScheme } from '~/lib/useColorScheme';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Label } from '~/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import { Checkbox } from '~/components/ui/checkbox';
import { demographics } from '../constants';

interface FilterModalProps {
  filteredDemographics: Record<string, string[]>;
  setFilteredDemographics: (demographics: Record<string, string[]>) => void;
}

const LONG_LABEL_THRESHOLD = Platform.select({
  android: 17,
  ios: 17,
  default: 20,
}); // Characters threshold for considering a label "long"

const FilterModal: React.FC<FilterModalProps> = ({
  filteredDemographics,
  setFilteredDemographics,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userSelectedDemographics, setUserSelectedDemographics] = useState<
    Record<string, string[]>
  >(() => {
    const initialState: Record<string, string[]> = {};
    demographics.forEach(demo => {
      initialState[demo.id] = filteredDemographics?.[demo.id] || [];
    });
    return initialState;
  });

  const { isDarkColorScheme } = useColorScheme();

  const modalBackgroundStyle = Platform.select({
    android: {
      backgroundColor: isDarkColorScheme
        ? 'rgba(0,0,0,0.9)'
        : 'rgba(255,255,255,0.9)',
    },
    default: {},
  });

  // Helper function to determine if a label is long
  const isLongLabel = (label: string) => label.length > LONG_LABEL_THRESHOLD;

  const renderOption = (
    id: string,
    label: string,
    value: string,
    selected: string[]
  ) => {
    const shouldTakeFullWidth = isLongLabel(label);

    return (
      <View
        className={`${shouldTakeFullWidth ? 'w-full' : 'w-1/2'}`}
        key={value}
      >
        <Checkbox
          id={value}
          checked={selected.includes(value)}
          onCheckedChange={() => {
            setUserSelectedDemographics(prevState => {
              const updatedData = { ...prevState };
              if (!updatedData[id]) {
                updatedData[id] = [];
              }
              if (updatedData[id].includes(value)) {
                updatedData[id] = updatedData[id].filter(
                  item => item !== value
                );
              } else {
                updatedData[id] = [...updatedData[id], value];
              }
              return updatedData;
            });
          }}
          label={<Label nativeID={value}>{label}</Label>}
        />
      </View>
    );
  };

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View className="flex-1" style={modalBackgroundStyle}>
          <View className="flex-1 px-4 py-6">
            <View
              className={`flex-1 rounded-3xl p-4 shadow-lg ${
                isDarkColorScheme ? 'bg-black' : 'bg-white'
              }`}
            >
              <Button
                size="icon"
                variant="ghost"
                className="self-end mb-2"
                onPress={() => setModalVisible(false)}
              >
                <AntDesign
                  name="close"
                  size={24}
                  color={isDarkColorScheme ? 'white' : 'black'}
                />
              </Button>

              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                  flexGrow: 1,
                }}
              >
                <Accordion
                  type="multiple"
                  collapsible
                  defaultValue={['item-1']}
                  className="w-full"
                >
                  {demographics.map(({ name, options, id }) => (
                    <AccordionItem
                      value={name}
                      key={id}
                      className={
                        Platform.OS === 'ios' ? 'border-b border-border' : ''
                      }
                    >
                      <AccordionTrigger>
                        <Text className="text-base font-medium">{name}</Text>
                      </AccordionTrigger>
                      <AccordionContent>
                        <View className="flex-row flex-wrap mt-2">
                          {id === 'occupation'
                            ? options?.map(
                                ({ label, value, subcategories }) => {
                                  const selected =
                                    userSelectedDemographics[id] || [];
                                  return (
                                    <View key={value} className="w-full mb-2">
                                      <Text className="font-bold mb-1">
                                        {label}
                                      </Text>
                                      <View className="flex-row flex-wrap">
                                        {subcategories?.map(subcategory =>
                                          renderOption(
                                            id,
                                            subcategory.label,
                                            subcategory.value,
                                            selected
                                          )
                                        )}
                                      </View>
                                    </View>
                                  );
                                }
                              )
                            : options?.map(({ label, value }) =>
                                renderOption(
                                  id,
                                  label,
                                  value,
                                  userSelectedDemographics[id] || []
                                )
                              )}
                        </View>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollView>

              <Button
                variant="outline"
                onPress={() => {
                  setFilteredDemographics(userSelectedDemographics);
                  setModalVisible(false);
                }}
                className="mt-4 bg-midnight"
              >
                <Text>Generate visualization</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Button
        variant="outline"
        onPress={() => {
          setUserSelectedDemographics(() => {
            const initialState: Record<string, string[]> = {};
            demographics.forEach(demo => {
              initialState[demo.id] = filteredDemographics?.[demo.id] || [];
            });
            return initialState;
          });
          setModalVisible(true);
        }}
        className="flex-row gap-2 z-10"
      >
        <Ionicons
          name="filter"
          size={16}
          color={isDarkColorScheme ? 'white' : 'black'}
        />
        <Text className="text-sm font-medium">Filter</Text>
      </Button>
    </View>
  );
};

export default FilterModal;
