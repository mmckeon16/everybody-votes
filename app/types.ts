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
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalVotes: number;
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
