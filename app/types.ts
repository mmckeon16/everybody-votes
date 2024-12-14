export interface Option {
  id: number;
  text: string;
}

export interface OptionResult {
  optionId: number;
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

export type RGB = {
  r: number;
  g: number;
  b: number;
};
