import { VoteData, AggregatedResults, OptionCount } from '../types';

/**
 * Formats the time remaining until the given end date
 * @param {string} endDateStr - End date string in any format parseable by Date constructor
 * @returns {string} Formatted time remaining (e.g., "5 days and 3 hours", "3 hours" or "45 minutes")
 * @throws {Error} If invalid date string provided
 */
const getTimeUntilExpiration = (endDateStr: string): string => {
  const endDate: Date = new Date(endDateStr);
  if (isNaN(endDate.getTime())) {
    console.log('Invalid date string provided');
    return '0 hours';
  }

  const now: Date = new Date();
  const diffMs: number = endDate.getTime() - now.getTime();
  const hoursRemaining: number = diffMs / (1000 * 60 * 60);

  // If more than 24 hours, show days and remaining hours
  if (Math.abs(hoursRemaining) >= 24) {
    const daysRemaining: number = Math.floor(Math.abs(hoursRemaining) / 24);
    const remainingHours: number = Math.floor(Math.abs(hoursRemaining) % 24);

    const daysText = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
    const hoursText = `${remainingHours} hour${
      remainingHours !== 1 ? 's' : ''
    }`;

    return `${daysText} and ${hoursText}`;
  }

  // If less than 1 hour remaining, show minutes
  if (Math.abs(hoursRemaining) < 1) {
    const minutesRemaining: number = Math.floor(Math.abs(diffMs) / (1000 * 60));
    return `${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`;
  }

  // Otherwise show hours
  const roundedHours: number = Math.floor(Math.abs(hoursRemaining));
  return `${roundedHours} hour${roundedHours !== 1 ? 's' : ''}`;
};

/**
 * Calculates the percentage of time remaining between start and end dates
 * @param {string} startDateStr - Start date string
 * @param {string} endDateStr - End date string
 * @returns {number} Integer percentage of time remaining (0-100)
 * @throws {Error} If invalid date strings provided or if end date is before start date
 */
const getTimeRemainingPercentage = (
  startDateStr: string,
  endDateStr: string
): number => {
  const startDate: Date = new Date(startDateStr);
  const endDate: Date = new Date(endDateStr);
  const now: Date = new Date();

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.log('Invalid date string provided');
    return 0;
  }

  if (endDate < startDate) {
    console.log('Invalid date string provided');
    return 0;
  }

  // Calculate total duration and time elapsed
  const totalDuration: number = endDate.getTime() - startDate.getTime();
  const timeElapsed: number = now.getTime() - startDate.getTime();

  // Calculate percentage remaining and round to nearest integer
  const percentageRemaining: number = Math.round(
    100 - (timeElapsed / totalDuration) * 100
  );

  // Handle edge cases
  if (percentageRemaining <= 0) return 0;
  if (percentageRemaining >= 100) return 100;

  return percentageRemaining;
};

const aggregateVotes = (data: VoteData[]): AggregatedResults | null => {
  if (!data || data.length === 0) return null;

  const questionText = data[0].options.questions.text;
  const totalVotes = data.length;

  // First pass to count votes
  const counts = data.reduce<
    Record<string, { id: string; text: string; count: number }>
  >((acc, item) => {
    const option = item.options;

    if (!acc[option.id]) {
      acc[option.id] = {
        id: option.id,
        text: option.text,
        count: 0,
      };
    }

    acc[option.id].count++;
    return acc;
  }, {});

  // Convert counts to percentages
  const options = Object.values(counts).map(option => ({
    id: option.id,
    text: option.text,
    percentage: Number(((option.count / totalVotes) * 100).toFixed(1)),
  }));

  return {
    options,
    questionText,
  };
};

export { getTimeUntilExpiration, getTimeRemainingPercentage, aggregateVotes };
