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
import Occupation from '../components/occupation';
import Income from '../components/income';
import { ProfileData } from '../../types';
import Toast from 'react-native-toast-message';

const STEPS = {
  AGE: 1,
  GENDER: 2,
  LOCATION: 3,
  POLITICS: 4,
  RACE: 5,
  OCCUPATION: 6,
  INCOME: 7,
};

export default function CompleteProfile() {
  const { session } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    age: '',
    gender: '',
    citizenship: '',
    raceEthnicity: '',
    incomeBracket: '',
    politicalParty: '',
    politicalIdeology: '',
    occupation: '',
    state: '',
    employmentStatus: '',
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
          //   metadata?.location?.country_code || prev.countryResidence,
          console.log(metadata);
          setProfileData(prev => ({
            ...prev,
            // Pre-fill data if available from social provider
            // countryResidence:
            //   metadata?.location?.country_code || prev.countryResidence,
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
        return profileData.citizenship !== '' && profileData.state !== '';
      case STEPS.RACE:
        return profileData.raceEthnicity !== '';
      case STEPS.POLITICS:
        return (
          profileData.politicalParty !== '' &&
          profileData.politicalIdeology !== ''
        );
      case STEPS.OCCUPATION:
        return profileData.occupation !== '';
      case STEPS.INCOME:
        return (
          profileData.incomeBracket !== '' &&
          profileData.employmentStatus !== ''
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

      console.log('profileData', profileData);

      await mutateAsync({
        profileData,
        userId: session.user.id,
      });

      // Update user metadata to mark profile as completed;
      // This is a workaround to get the profile status to update
      // because the auth state change listener doesn't trigger when we set it from the backend
      const { data, error } = await supabase.auth.updateUser({
        data: { completed_profile: true },
      });

      if (error) throw error;

      console.log('Profile status refreshed, attempting navigation...');

      // Add a small delay before navigation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try both navigation methods
      // why is this needed?
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
        position: 'bottom',
      });
      router.push('/');
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
      case STEPS.OCCUPATION:
        return (
          <Occupation
            profileData={profileData}
            setProfileData={setProfileData}
          />
        );
      case STEPS.INCOME:
        return (
          <Income profileData={profileData} setProfileData={setProfileData} />
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
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        paddingTop: 40,
      }}
    >
      <Text className="text-2xl text-center">Complete your profile</Text>
      <View className="my-8">
        <Progress
          value={(currentStep / Object.keys(STEPS).length) * 100}
          className="h-2"
          indicatorClassName="bg-lightBlue"
        />
      </View>
      {error && <Text>{error}</Text>}
      {renderStep()}
      {renderButtons()}
    </ScrollView>
  );
}
