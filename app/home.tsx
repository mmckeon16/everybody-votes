import { Text, View, Pressable } from "react-native";
import { ThemedText } from './ThemedText';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          padding: "15px"
        }}
      >
        <div style={{
            width:"100%",
          }}>
          <Pressable style={{
              display:'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#D4DFFF',
              borderRadius: '10px',
              height: '170px',
              padding: '10px'
            }}
            onPress={() => router.push('/vote')}
            >
              <div>
                <ThemedText 
                  type="banner">
                    Vote for the latest poll here
                </ThemedText>
                <AntDesign name="arrowright" size={48} color="black" />
              </div>
          </Pressable>
        </div>

        <Text>Edit app/index.tsx to edit this screen.</Text>
      </View>
  );
}
