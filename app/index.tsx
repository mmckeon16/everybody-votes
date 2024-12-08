import * as React from 'react';
import { Stack } from 'expo-router';
import Home from './home';

export default function App() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Everybody votes',
          // headerStyle: { backgroundColor: 'black' },
          // headerTintColor: '#fff',
          headerTitleStyle: {
            // fontWeight: 'bold',
          },
          headerTitle: 'Everybody votes',
        }}
      />
      <Home />
    </>
  );
}
