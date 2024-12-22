import * as React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '~/components/ui/dropdown-menu';
import { Text } from '~/components/ui/text';
import { demographics } from '../constants';

function Filter() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex flex-row gap-2 w-auto px-3">
          <Ionicons name="filter" size={16} color="black" />

          <Text>Filter</Text>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 native:w-72">
        <DropdownMenuLabel>Demographics</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {demographics.map(({ name, options }) => (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Text>{name}</Text>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <Animated.View entering={FadeIn.duration(200)}>
                  {name === 'Country of origin'
                    ? options?.map(option => (
                        <DropdownMenuCheckboxItem
                          checked={true}
                          onCheckedChange={() =>
                            console.log('hello there: ', option)
                          }
                        >
                          <Text>{option}</Text>
                        </DropdownMenuCheckboxItem>
                      ))
                    : options?.map(({ label, value }) => (
                        <DropdownMenuCheckboxItem
                          checked={true}
                          onCheckedChange={() => console.log('label', label)}
                        >
                          <Text>{value}</Text>
                        </DropdownMenuCheckboxItem>
                      ))}
                </Animated.View>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Filter;
