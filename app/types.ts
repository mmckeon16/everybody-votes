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
