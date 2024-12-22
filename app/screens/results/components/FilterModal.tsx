import React, { useState } from 'react';
import { Alert, Modal, ScrollView, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
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

const FilterModal = () => {
  const [modalVisible, setModalVisible] = useState(false); // TODO use useRef

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
        <ScrollView className="flex-1 items-center justify-center">
          <View className="m-5 bg-white rounded-3xl p-8 items-center shadow-lg w-screen">
            <Accordion
              type="multiple"
              collapsible
              defaultValue={['item-1']}
              className="w-full max-w-sm native:max-w-md"
            >
              {demographics.map(({ name, options }) => (
                <AccordionItem value={name}>
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
                      {name === 'Country of origin'
                        ? options?.map(option => (
                            <View className="flex flex-row gap-2 w-1/3 px-2">
                              <Checkbox
                                id={option}
                                checked={false}
                                onCheckedChange={() => {
                                  console.log('checked', option);
                                }}
                              />
                              <Label nativeID={option}>{option}</Label>
                            </View>
                          ))
                        : options?.map(({ label, value }) => (
                            <View className="flex flex-row gap-2 w-1/3 px-2">
                              <Checkbox
                                id={value}
                                checked={false}
                                onCheckedChange={() => {
                                  console.log('checked', label);
                                }}
                              />
                              <Label nativeID={value}>{label}</Label>
                            </View>
                          ))}
                    </ScrollView>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Button
              variant="outline"
              onPress={() => setModalVisible(!modalVisible)}
              className="mt-6"
            >
              <Text>Generate visualization</Text>
            </Button>
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
