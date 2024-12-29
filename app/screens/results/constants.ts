import {
  races,
  genders,
  states,
  allCitizenshipStatus,
  allPoliticalParties,
  employmentStatus,
  incomes,
  allPoliticalLeanings,
} from '../../auth/constants';
export const demographics = [
  {
    name: 'Gender',
    id: 'gender',
    selected: [],
    options: genders,
  },
  {
    name: 'Age',
    id: 'age',
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
    name: 'State',
    id: 'state',
    selected: [],
    options: states,
  },
  {
    name: 'Citizenship Status',
    id: 'citizenship',
    selected: [],
    options: allCitizenshipStatus,
  },
  {
    name: 'Race/Ethnicity',
    id: 'race_ethnicity',
    selected: [],
    options: races,
  },
  {
    name: 'Political Party',
    id: 'political_party',
    selected: [],
    options: allPoliticalParties,
  },
  {
    name: 'Political Leaning',
    id: 'political_leaning',
    selected: [],
    options: allPoliticalLeanings,
  },
  // {
  //   name: 'Occupation',
  //   id: 'occupation',
  //   selected: [],
  //   options: ,
  // },
  // TODO get from the expanded categories
  {
    name: 'Income bracket',
    id: 'income_bracket',
    selected: [],
    options: incomes,
  },
  {
    name: 'Employment Status',
    id: 'employment',
    selected: [],
    options: employmentStatus,
  },
];

export const ageMapping = {
  '<18': Array.from({ length: 17 }, (_, i) => i + 1),
  '18-25': Array.from({ length: 8 }, (_, i) => i + 18),
  '26-35': Array.from({ length: 10 }, (_, i) => i + 26),
  '36-45': Array.from({ length: 10 }, (_, i) => i + 36),
  '46-55': Array.from({ length: 10 }, (_, i) => i + 46),
  '56-65': Array.from({ length: 10 }, (_, i) => i + 56),
  '66-75': Array.from({ length: 10 }, (_, i) => i + 66),
  '75+': Array.from({ length: 41 }, (_, i) => i + 75), // Going up to age 115 for the 75+ category
};

export default {
  demographics,
};
