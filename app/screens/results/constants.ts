// TODO get this from db table or onboarding as we change/add more
import { countries } from '../../auth/constants';
export const demographics = [
  {
    name: 'Gender',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Non-binary', value: 'non-binary' },
    ],
  },
  {
    name: 'Age',
    options: [
      { label: '<18', value: 'TBD' },
      { label: '18-25', value: 'TBD' },
      { label: '26-35', value: 'TBD' },
      { label: '36-45', value: 'TBD' },
      { label: '46-55', value: 'TBD' },
      { label: '56-65', value: 'TBD' },
      { label: '66-75', value: 'TBD' },
      { label: '75+', value: 'TBD' },
    ],
  },
  {
    name: 'Country of origin',
    options: [...countries],
  },
  {
    name: 'Race/Ethnicity',
    options: [
      { label: 'Asian', value: 'asian' },
      { label: 'Black/African', value: 'black' },
      { label: 'Hispanic/Latino', value: 'hispanic' },
      { label: 'White/Caucasian', value: 'white' },
      { label: 'Mixed', value: 'mixed' },
    ],
  },
  {
    name: 'Politics',
    options: [
      { label: 'Conservative', value: 'conservative' },
      { label: 'Liberal', value: 'liberal' },
      { label: 'Moderate', value: 'moderate' },
    ],
  },

  {
    name: 'Occupation',
    options: [
      { label: 'balls', value: 'balls' },
      { label: 'penis', value: 'penis' },
      { label: 'hi', value: 'hi' },
    ],
  },
  {
    name: 'Income bracket',
    options: [
      { label: 'balls', value: 'balls' },
      { label: 'penis', value: 'penis' },
      { label: 'hi', value: 'hi' },
    ],
  },
];
