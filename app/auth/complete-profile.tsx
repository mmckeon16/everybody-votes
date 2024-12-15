import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Progress } from '~/components/ui/progress';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../hooks/useOnboarding';
import Age from './components/age';
import Gender from './components/gender';
import Location from './components/location';
import Demographics from './components/demographics';
import SocioEconomic from './components/socioEconomic';

import { ProfileData } from '../types';

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
          <Demographics
            profileData={profileData}
            setProfileData={setProfileData}
          />
        );

      case STEPS.SOCIOECONOMIC:
        return (
          <SocioEconomic
            profileData={profileData}
            setProfileData={setProfileData}
          />
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
