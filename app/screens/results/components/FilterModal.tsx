import React, { useState, useEffect } from 'react';
import { Alert, Modal, ScrollView, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
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
import ScrollingText from './ScrollingText';

interface FilterModalProps {
  filteredDemographics: object;
  setFilteredDemographics: Function;
}

const FilterModal: React.FC<FilterModalProps> = ({
  filteredDemographics,
  setFilteredDemographics,
}) => {
  const [modalVisible, setModalVisible] = useState(false); // TODO use useRef
  const [data, setData] = useState(demographics); // TODO use useRef
  const [userSelectedDemographics, setUserSelectedDemographics] = useState(
    filteredDemographics
  ); // TODO use useRef

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
            <View className="m-5 bg-white rounded-3xl p-8 items-center shadow-lg w-full">
              <Button
                size="icon"
                variant="ghost"
                className="self-end"
                onPress={() => setModalVisible(false)}
              >
                <AntDesign name="close" size={24} />
              </Button>
              <Accordion
                type="multiple"
                collapsible
                defaultValue={['item-1']}
                className="w-full native:max-w-md"
              >
                {data.map(({ name, options, selected = [] }, index) => (
                  <AccordionItem value={name} key={name}>
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
                        {options?.map(({ label, value }) => {
                          return (
                            <View
                              className="w-1/2 flex flex-row items-center gap-2 px-2 py-1"
                              key={value}
                            >
                              <Checkbox
                                id={value}
                                checked={selected.includes(value)}
                                onCheckedChange={() => {
                                  let updatedData = data;
                                  if (selected.includes(value)) {
                                    const updatedSelected = data[
                                      index
                                    ]?.selected.filter(item => item !== value);
                                    updatedData[index] = {
                                      ...updatedData[index],
                                      selected: updatedSelected,
                                    };
                                  } else {
                                    updatedData[index]?.selected?.push(value);
                                  }
                                  setUserSelectedDemographics({
                                    ...userSelectedDemographics,
                                    [updatedData[index].id]:
                                      updatedData[index]?.selected,
                                  });
                                  setData([...updatedData]);
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
                  setModalVisible(!modalVisible);
                  setFilteredDemographics(userSelectedDemographics);
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
        onPress={() => setModalVisible(true)}
        className="flex flex-row gap-2 w-auto px-3"
      >
        <Ionicons name="filter" size={16} color="black" />

        <Text>Filter</Text>
      </Button>
    </View>
  );
};

export default FilterModal;
