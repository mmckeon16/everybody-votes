import { View, Pressable } from "react-native";
import ThemedText from './ThemedText';
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
              height: '130px',
              padding: '10px'
            }}
            onPress={() => router.push('/vote')}
            >
              <div>
                <ThemedText 
                  type="banner">
                    Vote for the latest poll here
                </ThemedText>
                <AntDesign name="arrowright" size={32} color="black" />
              </div>
          </Pressable>
        </div>

      </View>
  );
}
