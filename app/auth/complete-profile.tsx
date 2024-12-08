import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ThemedText from '../components/ThemedText';
import { Picker } from '@react-native-picker/picker';

interface ProfileData {
  age: string;
  gender: string;
  countryResidence: string;
  raceEthnicity: string;
  incomeBracket: string;
  politicalAffiliation: string;
  occupation: string;
  countryOrigin: string;
}

export default function CompleteProfile() {
  const { session } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    age: '',
    gender: '',
    countryResidence: '',
    raceEthnicity: '',
    incomeBracket: '',
    politicalAffiliation: '',
    occupation: '',
    countryOrigin: '',
  });

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from('demographics').insert({
        user_id: session?.user.id,
        age: parseInt(profileData.age),
        gender: profileData.gender,
        country_residence: profileData.countryResidence,
        race_ethnicity: profileData.raceEthnicity,
        income_bracket: profileData.incomeBracket,
        political_affiliation: profileData.politicalAffiliation,
        occupation: profileData.occupation,
        country_origin: profileData.countryOrigin,
      });

      if (error) throw error;
      router.replace('/(app)');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={profileData.age}
              onChangeText={(value) =>
                setProfileData({ ...profileData, age: value })
              }
              keyboardType="numeric"
            />
            <Picker
              selectedValue={profileData.gender}
              onValueChange={(value) =>
                setProfileData({ ...profileData, gender: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Non-binary" value="non-binary" />
              <Picker.Item
                label="Prefer not to say"
                value="prefer-not-to-say"
              />
            </Picker>
          </>
        );
      // Add cases for other steps...
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Complete Your Profile
      </ThemedText>

      <View style={styles.progressBar}>
        <View
          style={[styles.progress, { width: `${(currentStep / 3) * 100}%` }]}
        />
      </View>

      {error && (
        <ThemedText type="error" style={styles.error}>
          {error}
        </ThemedText>
      )}

      {renderStep()}

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <ThemedText type="button">Previous</ThemedText>
          </TouchableOpacity>
        )}

        {currentStep < 3 ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCurrentStep(currentStep + 1)}
          >
            <ThemedText type="button">Next</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <ThemedText type="button">Complete</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginBottom: 30,
  },
  progress: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
  },
  picker: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  error: {
    marginBottom: 20,
    textAlign: 'center',
  },
});
