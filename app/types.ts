export interface Option {
  id: string;
  text: string;
}

export interface OptionResult {
  optionId: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  total_votes: number;
  results: OptionResult[];
}

export interface QuestionInResult {
  id: string;
  text: string;
}

export interface OptionInVoteData {
  id: string;
  text: string;
  question_id: string;
  questions: QuestionInResult;
}

export interface VoteData {
  id: string;
  created_at: string;
  options: OptionInVoteData;
}

export interface OptionPercentage {
  id: string;
  text: string;
  percentage: number;
}

export interface AggregatedResults {
  options: OptionPercentage[];
  questionText: string;
}

export interface ProfileData {
  age: string;
  gender: string;
  state: string;
  raceEthnicity: string;
  incomeBracket: string;
  politicalParty: string;
  politicalIdeology: string;
  occupation: string;
  citizenship: string;
  employmentStatus: string;
}

export interface StepProps {
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
}

export type RGB = {
  r: number;
  g: number;
  b: number;
};

export interface IconProps {
  size: number;
  color: string;
}

export interface ProviderButtonProps {
  provider: string;
  providerDisplayName: string;
  IconComponent: React.FC<IconProps>;
  isSmall: boolean;
}

export interface ActiveQuestion {
  id: string;
  text: string;
  options: Option[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  userVote?: string; // ID of the option the user selected
}

// Define types for our occupation data
export type OccupationSubcategory = {
  label: string;
  value: string;
};

export type OccupationCategory = {
  label: string;
  value: string;
  subcategories: OccupationSubcategory[];
};

export type DemographicKey =
  | 'age'
  | 'citizenship'
  | 'employment'
  | 'gender'
  | 'income_bracket'
  | 'political_leaning'
  | 'political_party'
  | 'race_ethnicity'
  | 'state';

interface DemographicData {
  age?: number[];
  citizenship?: string[];
  employment?: string[];
  gender?: string[];
  income_bracket?: string[];
  political_leaning?: string[];
  political_party?: string[];
  race_ethnicity?: string[];
  state?: string[];
}

export interface PillData {
  category: DemographicKey;
  displayText: string;
  originalValue: string | number;
}

export interface DemographicPillsProps {
  data: DemographicData;
  onRemove?: (category: DemographicKey, originalValue: string | number) => void;
}
