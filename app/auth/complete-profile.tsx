import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Progress } from '~/components/ui/progress';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { useOnboarding } from '../hooks/useOnboarding';
import Age from './components/age';
import Gender from './components/gender';
import Location from './components/location';

import { ProfileData } from '../types';
// import { countries } from '../constants/countries';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
];

const STEPS = {
  AGE: 1,
  GENDER: 2,
  LOCATION: 3,
  DEMOGRAPHICS: 4,
  SOCIOECONOMIC: 5,
};

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

  useEffect(() => {
    const prefillUserData = async () => {
      if (session?.user) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (user) {
          // Get user metadata from social provider
          const metadata = user.user_metadata;

          setProfileData(prev => ({
            ...prev,
            // Pre-fill data if available from social provider
            countryResidence:
              metadata?.location?.country_code || prev.countryResidence,
            occupation: metadata?.occupation || prev.occupation,
            // Add any other fields that might come from social login
          }));
        }
      }
    };

    prefillUserData();
  }, [session]);

  const isStepValid = () => {
    switch (currentStep) {
      case STEPS.AGE:
        return profileData.age !== '';
      case STEPS.GENDER:
        return profileData.gender !== '';
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

  const handleSubmit = async () => {
    try {
      // First update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          completed_profile: true,
          ...profileData,
        },
      });

      if (updateError) throw updateError;

      // Then submit to your onboarding mutation
      await mutateAsync({
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

  const handleSkip = async () => {
    try {
      // Mark profile as completed even with minimal data
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          completed_profile: true,
          // Include only required fields
          countryResidence: profileData.countryResidence,
          age: profileData.age,
        },
      });

      if (updateError) throw updateError;

      router.replace('/(app)');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.AGE:
        return (
          <Age profileData={profileData} setProfileData={setProfileData} />
        );
      case STEPS.GENDER:
        return (
          <Gender profileData={profileData} setProfileData={setProfileData} />
        );

      case STEPS.LOCATION:
        return (
          <Location profileData={profileData} setProfileData={setProfileData} />
        );

      case STEPS.DEMOGRAPHICS:
        return (
          <>
            <Picker
              selectedValue={profileData.raceEthnicity}
              onValueChange={value =>
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
              onValueChange={value =>
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
              onValueChange={value =>
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
              onValueChange={value =>
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

  const renderButtons = () => (
    <View style={styles.buttonContainer}>
      {currentStep > 1 ? (
        <Button
          variant="outline"
          className="shadow shadow-foreground/5"
          onPress={() => setCurrentStep(currentStep - 1)}
        >
          <Text>Previous</Text>
        </Button>
      ) : (
        <View />
      )}

      {currentStep < Object.keys(STEPS).length ? (
        <>
          <Button
            variant="outline"
            className="shadow shadow-foreground/5"
            onPress={() => setCurrentStep(currentStep + 1)}
            disabled={!isStepValid()}
          >
            <Text>Next</Text>
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          className="shadow shadow-foreground/5"
          onPress={handleSubmit}
          disabled={!isStepValid()}
        >
          <Text>Complete</Text>
        </Button>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text className="text-3xl text-center">Complete Your Profile</Text>

      <Progress
        value={(currentStep / Object.keys(STEPS).length) * 100}
        className="h-2 my-8"
        indicatorClassName="bg-sky-600"
      />

      {error && <Text>{error}</Text>}
      {renderStep()}
      {renderButtons()}
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
  skipButton: {
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
});
