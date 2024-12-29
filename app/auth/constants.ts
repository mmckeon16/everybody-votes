export const demographics = [
  { label: 'American Indian or Alaska Native', value: 'native-american' },
  { label: 'Asian', value: 'asian' },
  { label: 'Black or African American', value: 'black' },
  { label: 'Hispanic or Latino', value: 'hispanic' },
  { label: 'Native Hawaiian or Pacific Islander', value: 'pacific-islander' },
  { label: 'White or Caucasian', value: 'white' },
  { label: 'Middle Eastern or North African', value: 'mena' },
  { label: 'Two or More Races', value: 'multiracial' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export const genders = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non-binary' },
  { label: 'Transgender Male', value: 'transgender-male' },
  { label: 'Transgender Female', value: 'transgender-female' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export const states = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'American Samoa', value: 'AS' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'District of Columbia', value: 'DC' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Guam', value: 'GU' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Northern Mariana Islands', value: 'MP' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Puerto Rico', value: 'PR' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'U.S. Virgin Islands', value: 'VI' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
  { label: 'Not in US', value: 'not-in-us' },
];

export const citizenshipStatus = [
  { label: 'Natural born US Citizen', value: 'natural-born-citizen' },
  { label: 'Foreign born US Citizen', value: 'foreign-born-citizen' },
  { label: 'Not a US Citizen', value: 'non-citizen' },
  { label: 'Permanent Resident', value: 'permanent-resident' },
  { label: 'Temporary Work Visa holder', value: 'work-visa' },
  { label: 'Student Visa holder', value: 'student-visa' },
  { label: 'DACA recipient', value: 'daca' },
  { label: 'Asylum seeker/Refugee', value: 'asylum-refugee' },
  { label: 'Other valid immigration status', value: 'other-status' },
  { label: 'Prefer not to answer', value: 'prefer-not-to-say' },
];

export const majorPoliticalParties = [
  { label: 'Democrat Party', value: 'democrat' },
  { label: 'Republican Party', value: 'republican' },
  { label: 'Green Party', value: 'green' },
  { label: 'Libertarian Party', value: 'libertarian' },
  { label: 'Independent Party', value: 'independent' },
];

export const otherPoliticalParties = [
  { label: 'Constitution Party', value: 'constitution' },
  { label: 'Reform Party', value: 'reform' },
  { label: 'Working Families Party', value: 'working-families' },
  { label: 'Peace and Freedom Party', value: 'peace-freedom' },
  { label: 'American Solidarity Party', value: 'solidarity' },
  { label: 'Other not listed', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export const allPoliticalParties = [
  ...majorPoliticalParties,
  ...otherPoliticalParties,
];

export const employmentStatus = [
  { label: 'Retired', value: 'retired' },
  { label: 'Unemployed', value: 'unemployed' },
  { label: 'Employed', value: 'employed' },
  { label: 'Student', value: 'student' },
  { label: 'Self-employed', value: 'self-employed' },
  { label: 'Stay-at-home Parent/Caretaker', value: 'caretaker' },
  { label: 'Unable to Work/Disabled', value: 'disabled' },
  { label: 'Part-time Employed', value: 'part-time' },
];

export const incomes = [
  { label: 'Under $25,000', value: 'under-25k' },
  { label: '$25,000 - $49,999', value: '25k-50k' },
  { label: '$50,000 - $74,999', value: '50k-75k' },
  { label: '$75,000 - $99,999', value: '75k-100k' },
  { label: '$100,000 - $149,999', value: '100k-150k' },
  { label: '$150,000 - $199,999', value: '150k-200k' },
  { label: '$200,000 - $299,999', value: '200k-300k' },
  { label: '$300,000 - $499,999', value: '300k-500k' },
  { label: '$500,000 - $999,999', value: '500k-1m' },
  { label: '$1,000,000 or more', value: '1m-plus' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export const mainPoliticalLeanings = [
  { label: 'Conservative', value: 'conservative' },
  { label: 'Lean Conservative', value: 'lean-conservative' },
  { label: 'Liberal', value: 'liberal' },
  { label: 'Lean Liberal', value: 'lean-liberal' },
  { label: 'Moderate', value: 'moderate' },
];

export const otherPoliticalLeanings = [
  { label: 'Anarchist', value: 'anarchist' },
  { label: 'Communist', value: 'communist' },
  { label: 'Democratic Socialist', value: 'democratic-socialist' },
  { label: 'Fascist', value: 'fascist' },
  { label: 'Libertarian', value: 'libertarian' },
  { label: 'Marxist', value: 'marxist' },
  { label: 'Neoliberal', value: 'neoliberal' },
  { label: 'Populist', value: 'populist' },
  { label: 'Progressive', value: 'progressive' },
  { label: 'Socialist', value: 'socialist' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export const allPoliticalLeanings = [
  ...mainPoliticalLeanings,
  ...otherPoliticalLeanings,
];
