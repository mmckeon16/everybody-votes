import {
  races,
  genders,
  states,
  citizenshipStatus,
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
    options: citizenshipStatus,
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

export default {
  demographics,
};
