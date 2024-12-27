// TODO get this from db table or onboarding as we change/add more
import { countries } from '../../auth/constants';
export const demographics = [
  {
    name: 'Gender',
    selected: [],
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Non-binary', value: 'non-binary' },
    ],
  },
  {
    name: 'Age',
    selected: [],
    options: [
      { label: '<18', value: '<18' },
      { label: '18-25', value: '18-25' },
      { label: '26-35', value: '26-35' },
      { label: '36-45', value: '36-45' },
      { label: '46-55', value: '46-55' },
      { label: '56-65', value: '56-65' },
      { label: '66-75', value: '66-75' },
      { label: '75+', value: '75+' },
    ],
  },
  {
    name: 'Country of origin',
    selected: [],
    options: [...countries],
  },
  {
    name: 'Race/Ethnicity',
    selected: [],
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
    selected: [],
    options: [
      { label: 'Conservative', value: 'conservative' },
      { label: 'Liberal', value: 'liberal' },
      { label: 'Moderate', value: 'moderate' },
    ],
  },

  {
    name: 'Occupation',
    selected: [],
    options: [
      { label: 'balls', value: 'balls' },
      { label: 'penis', value: 'penis' },
      { label: 'hi', value: 'hi' },
    ],
  },
  {
    name: 'Income bracket',
    selected: [],
    options: [
      { label: 'balls', value: 'balls' },
      { label: 'penis', value: 'penis' },
      { label: 'hi', value: 'hi' },
    ],
  },
];
