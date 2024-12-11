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
import { useOnboarding } from '../hooks/useOnboarding';
// import { countries } from '../constants/countries';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
];

const STEPS = {
  BASIC_INFO: 1,
  LOCATION: 2,
  DEMOGRAPHICS: 3,
  SOCIOECONOMIC: 4,
};

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
  const { mutateAsync, isPending } = useOnboarding();

  const isStepValid = () => {
    switch (currentStep) {
      case STEPS.BASIC_INFO:
        return profileData.age !== '' && profileData.gender !== '';
      case STEPS.LOCATION:
        return (
          profileData.countryResidence !== '' &&
          profileData.countryOrigin !== ''
        );
      case STEPS.DEMOGRAPHICS:
        return (
          profileData.raceEthnicity !== '' &&
          profileData.politicalAffiliation !== ''
        );
      case STEPS.SOCIOECONOMIC:
        return (
          profileData.occupation !== '' && profileData.incomeBracket !== ''
        );
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    try {
      const submitOnboarding = mutateAsync({
        profileData,
        userId: session?.user.id || '',
      });
      router.replace('/(app)');
    } catch (err) {
      console.log(err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.BASIC_INFO:
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

      case STEPS.LOCATION:
        return (
          <>
            <Picker
              selectedValue={profileData.countryOrigin}
              onValueChange={(value) =>
                setProfileData({ ...profileData, countryOrigin: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Country of Origin" value="" />
              {countries.map((country) => (
                <Picker.Item
                  key={country.code}
                  label={country.name}
                  value={country.code}
                />
              ))}
            </Picker>
            <Picker
              selectedValue={profileData.countryResidence}
              onValueChange={(value) =>
                setProfileData({ ...profileData, countryResidence: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Country of Residence" value="" />
              {countries.map((country) => (
                <Picker.Item
                  key={country.code}
                  label={country.name}
                  value={country.code}
                />
              ))}
            </Picker>
          </>
        );

      case STEPS.DEMOGRAPHICS:
        return (
          <>
            <Picker
              selectedValue={profileData.raceEthnicity}
              onValueChange={(value) =>
                setProfileData({ ...profileData, raceEthnicity: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Race/Ethnicity" value="" />
              <Picker.Item label="Asian" value="asian" />
              <Picker.Item label="Black/African" value="black" />
              <Picker.Item label="Hispanic/Latino" value="hispanic" />
              <Picker.Item label="White/Caucasian" value="white" />
              <Picker.Item label="Mixed" value="mixed" />
              <Picker.Item label="Other" value="other" />
              <Picker.Item
                label="Prefer not to say"
                value="prefer-not-to-say"
              />
            </Picker>
            <Picker
              selectedValue={profileData.politicalAffiliation}
              onValueChange={(value) =>
                setProfileData({ ...profileData, politicalAffiliation: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Political Affiliation" value="" />
              <Picker.Item label="Conservative" value="conservative" />
              <Picker.Item label="Liberal" value="liberal" />
              <Picker.Item label="Moderate" value="moderate" />
              <Picker.Item label="Other" value="other" />
              <Picker.Item
                label="Prefer not to say"
                value="prefer-not-to-say"
              />
            </Picker>
          </>
        );

      case STEPS.SOCIOECONOMIC:
        return (
          <>
            <Picker
              selectedValue={profileData.occupation}
              onValueChange={(value) =>
                setProfileData({ ...profileData, occupation: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Occupation" value="" />
              <Picker.Item label="Student" value="student" />
              <Picker.Item label="Professional" value="professional" />
              <Picker.Item label="Service Worker" value="service" />
              <Picker.Item label="Self-employed" value="self-employed" />
              <Picker.Item label="Retired" value="retired" />
              <Picker.Item label="Other" value="other" />
            </Picker>
            <Picker
              selectedValue={profileData.incomeBracket}
              onValueChange={(value) =>
                setProfileData({ ...profileData, incomeBracket: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Income Bracket" value="" />
              <Picker.Item label="Under $25,000" value="under-25k" />
              <Picker.Item label="$25,000 - $49,999" value="25k-50k" />
              <Picker.Item label="$50,000 - $74,999" value="50k-75k" />
              <Picker.Item label="$75,000 - $99,999" value="75k-100k" />
              <Picker.Item label="$100,000+" value="100k-plus" />
              <Picker.Item
                label="Prefer not to say"
                value="prefer-not-to-say"
              />
            </Picker>
          </>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Complete Your Profile
      </ThemedText>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progress,
            { width: `${(currentStep / Object.keys(STEPS).length) * 100}%` },
          ]}
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

        {currentStep < Object.keys(STEPS).length ? (
          <TouchableOpacity
            style={[styles.button, !isStepValid() && styles.buttonDisabled]}
            onPress={() => setCurrentStep(currentStep + 1)}
            disabled={!isStepValid()}
          >
            <ThemedText type="button">Next</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, !isStepValid() && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!isStepValid()}
          >
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
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  error: {
    marginBottom: 20,
    textAlign: 'center',
  },
});
