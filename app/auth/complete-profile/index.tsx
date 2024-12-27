import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Progress } from '~/components/ui/progress';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../hooks/useOnboarding';
import Age from '../components/age';
import Gender from '../components/gender';
import Location from '../components/location';
import Race from '../components/race';
import Politics from '../components/politics';
import SocioEconomic from '../components/socioEconomic';

import { ProfileData } from '../../types';
import Toast from 'react-native-toast-message';

const STEPS = {
  AGE: 1,
  GENDER: 2,
  LOCATION: 3,
  POLITICS: 4,
  RACE: 5,
  SOCIOECONOMIC: 6,
};

export default function CompleteProfile() {
  const { session, refreshProfileStatus } = useAuth();
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

          setProfileData((prev) => ({
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
      case STEPS.RACE:
        return profileData.raceEthnicity !== '';
      case STEPS.POLITICS:
        return profileData.politicalAffiliation !== '';
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
      if (!session?.user?.id) {
        throw new Error('No authenticated user found');
      }

      console.log('Starting profile submission...');

      const result = await mutateAsync({
        profileData,
        userId: session.user.id,
      });

      console.log('Profile data submitted, result:', result);

      // Force refresh the profile status
      console.log('Refreshing profile status...');
      // await refreshProfileStatus();

      console.log('Profile status refreshed, attempting navigation...');

      // Add a small delay before navigation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Try both navigation methods
      try {
        await router.push('/auth/celebrate');
      } catch (navError) {
        console.error('Navigation error:', navError);
        // Fallback navigation
        router.replace('/auth/celebrate');
      }

      console.log('Navigation completed');
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err instanceof Error ? err.message : 'Failed to submit profile',
      });
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
      case STEPS.RACE:
        return (
          <Race profileData={profileData} setProfileData={setProfileData} />
        );
      case STEPS.POLITICS:
        return (
          <Politics profileData={profileData} setProfileData={setProfileData} />
        );
      case STEPS.SOCIOECONOMIC:
        return (
          <SocioEconomic
            profileData={profileData}
            setProfileData={setProfileData}
          />
        );
      default:
        return <View />; // Return empty view as fallback
    }
  };

  const renderButtons = () => (
    <View className="flex flex-row justify-between mt-5">
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
    <ScrollView className="flex p-5">
      <Text className="text-2xl text-center">Complete your profile</Text>
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
