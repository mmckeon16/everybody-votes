import React, { useState, useEffect } from 'react';
import { Alert, Modal, ScrollView, View } from 'react-native';
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
  filteredDemographics: object;
  setFilteredDemographics: Function;
}

const FilterModal: React.FC<FilterModalProps> = ({
  filteredDemographics,
  setFilteredDemographics,
}) => {
  const [modalVisible, setModalVisible] = useState(false); // TODO use useRef
  const [userSelectedDemographics, setUserSelectedDemographics] = useState(
    filteredDemographics ? filteredDemographics : []
  ); // TODO use useRef
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}
      >
        <ScrollView>
          <View className="flex-1 items-center justify-center px-5 min-h-screen">
            <View
              className={`m-5 rounded-3xl p-8 items-center shadow-lg w-full ${
                isDarkColorScheme ? 'bg-black' : 'bg-white'
              }`}
            >
              <Button
                size="icon"
                variant="ghost"
                className="self-end"
                onPress={() => setModalVisible(false)}
              >
                <AntDesign
                  name="close"
                  size={24}
                  color={isDarkColorScheme ? 'white' : 'black'}
                />
              </Button>
              <Accordion
                type="multiple"
                collapsible
                defaultValue={['item-1']}
                className="w-full native:max-w-md"
              >
                {demographics.map(({ name, options, id }, index) => (
                  <AccordionItem value={name} key={id}>
                    <AccordionTrigger>
                      <Text>{name}</Text>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollView
                        className="max-h-52"
                        contentContainerStyle={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 8, // This will add spacing between items
                          flexGrow: 1,
                        }}
                      >
                        {id === 'occupation'
                          ? options?.map(({ label, value, subcategories }) => {
                              const selected = userSelectedDemographics
                                ? userSelectedDemographics[id]
                                : null;
                              return (
                                <View key={value}>
                                  <Text>{label}</Text>
                                  {subcategories?.map(subcategory => (
                                    <View
                                      className="w-1/2 flex flex-row items-center gap-2 px-2 py-1"
                                      key={subcategory.value}
                                    >
                                      <Checkbox
                                        id={subcategory.value}
                                        checked={selected?.includes(
                                          subcategory.value
                                        )}
                                        onCheckedChange={() => {
                                          setUserSelectedDemographics(
                                            prevState => {
                                              const updatedData = {
                                                ...prevState,
                                              };
                                              if (
                                                updatedData[id]?.includes(
                                                  subcategory.value
                                                )
                                              ) {
                                                updatedData[id] = updatedData[
                                                  id
                                                ].filter(
                                                  item =>
                                                    item !== subcategory.value
                                                );
                                              } else {
                                                updatedData[id] = [
                                                  ...(updatedData[id] || []),
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
                                        className="flex-1 flex-shrink"
                                        numberOfLines={1}
                                      >
                                        {subcategory.label}
                                      </Label>
                                    </View>
                                  ))}
                                </View>
                              );
                            })
                          : options?.map(({ label, value }) => {
                              const selected = userSelectedDemographics
                                ? userSelectedDemographics[id]
                                : null;
                              return (
                                <View
                                  className="w-1/2 flex flex-row items-center gap-2 px-2 py-1"
                                  key={value}
                                >
                                  <Checkbox
                                    id={value}
                                    checked={selected?.includes(value)}
                                    onCheckedChange={() => {
                                      setUserSelectedDemographics(prevState => {
                                        const updatedData = { ...prevState };
                                        if (updatedData[id]?.includes(value)) {
                                          updatedData[id] = updatedData[
                                            id
                                          ].filter(item => item !== value);
                                        } else {
                                          updatedData[id] = [
                                            ...(updatedData[id] || []),
                                            value,
                                          ];
                                        }
                                        return updatedData;
                                      });
                                    }}
                                  />
                                  <Label
                                    nativeID={value}
                                    className="flex-1 flex-shrink"
                                    numberOfLines={1}
                                  >
                                    {label}
                                  </Label>
                                </View>
                              );
                            })}
                      </ScrollView>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button
                variant="outline"
                onPress={() => {
                  setFilteredDemographics(userSelectedDemographics);
                  setModalVisible(!modalVisible);
                }}
                className="mt-6"
              >
                <Text>Generate visualization</Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </Modal>
      <Button
        variant="outline"
        onPress={() => {
          setUserSelectedDemographics(filteredDemographics);
          setModalVisible(true);
        }}
        className="flex flex-row gap-2 px-3"
      >
        <View>
          <Ionicons
            name="filter"
            size={16}
            color={isDarkColorScheme ? 'white' : 'black'}
          />
        </View>
        <Text>Filter</Text>
      </Button>
    </View>
  );
};

export default FilterModal;
