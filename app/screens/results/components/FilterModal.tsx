import React, { useState, useEffect } from 'react';
import { Alert, Modal, ScrollView, View, Platform } from 'react-native';
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

const FilterModal: React.FC<FilterModalProps> = ({
  filteredDemographics,
  setFilteredDemographics,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userSelectedDemographics, setUserSelectedDemographics] = useState<
    Record<string, string[]>
  >(() => {
    // Initialize with empty arrays for each demographic category
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
                    <AccordionItem value={name} key={id}>
                      <AccordionTrigger>
                        <Text>{name}</Text>
                      </AccordionTrigger>
                      <AccordionContent>
                        <View className="flex-row flex-wrap">
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
                                        {subcategories?.map(subcategory => (
                                          <View
                                            className="w-1/2 flex-row items-center px-2 py-1"
                                            key={subcategory.value}
                                          >
                                            <Checkbox
                                              id={subcategory.value}
                                              checked={selected.includes(
                                                subcategory.value
                                              )}
                                              onCheckedChange={() => {
                                                setUserSelectedDemographics(
                                                  prevState => {
                                                    const updatedData = {
                                                      ...prevState,
                                                    };
                                                    if (!updatedData[id]) {
                                                      updatedData[id] = [];
                                                    }
                                                    if (
                                                      updatedData[id].includes(
                                                        subcategory.value
                                                      )
                                                    ) {
                                                      updatedData[
                                                        id
                                                      ] = updatedData[
                                                        id
                                                      ].filter(
                                                        item =>
                                                          item !==
                                                          subcategory.value
                                                      );
                                                    } else {
                                                      updatedData[id] = [
                                                        ...updatedData[id],
                                                        subcategory.value,
                                                      ];
                                                    }
                                                    return updatedData;
                                                  }
                                                );
                                              }}
                                            />
                                            <Label
                                              nativeID={subcategory.value}
                                              className="flex-1 ml-2"
                                              numberOfLines={1}
                                            >
                                              {subcategory.label}
                                            </Label>
                                          </View>
                                        ))}
                                      </View>
                                    </View>
                                  );
                                }
                              )
                            : options?.map(({ label, value }) => {
                                const selected =
                                  userSelectedDemographics[id] || [];
                                return (
                                  <View
                                    className="w-1/2 flex-row items-center px-2 py-1"
                                    key={value}
                                  >
                                    <Checkbox
                                      id={value}
                                      checked={selected.includes(value)}
                                      onCheckedChange={() => {
                                        setUserSelectedDemographics(
                                          prevState => {
                                            const updatedData = {
                                              ...prevState,
                                            };
                                            if (!updatedData[id]) {
                                              updatedData[id] = [];
                                            }
                                            if (
                                              updatedData[id].includes(value)
                                            ) {
                                              updatedData[id] = updatedData[
                                                id
                                              ].filter(item => item !== value);
                                            } else {
                                              updatedData[id] = [
                                                ...updatedData[id],
                                                value,
                                              ];
                                            }
                                            return updatedData;
                                          }
                                        );
                                      }}
                                    />
                                    <Label
                                      nativeID={value}
                                      className="flex-1 ml-2"
                                      numberOfLines={1}
                                    >
                                      {label}
                                    </Label>
                                  </View>
                                );
                              })}
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
                className="mt-4"
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
            // Reset to current filtered demographics or empty arrays
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
