import { VoteData, AggregatedResults, OptionPercentage, RGB } from '../types';

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
  const percentagePassed: number = Math.round(
    (timeElapsed / totalDuration) * 100
  );

  // Handle edge cases
  if (percentagePassed <= 0) return 1;
  if (percentagePassed >= 100) return 100;

  return percentagePassed;
};

function addColorToResults<T>(results: T[]): (T & { color: string })[] {
  const colors = returnSetColors();

  return results.map((result, index) => ({
    ...result,
    color: colors[index % colors.length], // Use modulo to cycle through colors
  }));
}

function getColorDistance(color1: RGB, color2: RGB): number {
  // Calculate Euclidean distance between colors in RGB space
  const rDiff = color1.r - color2.r;
  const gDiff = color1.g - color2.g;
  const bDiff = color1.b - color2.b;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

function rgbToHex(color: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

function getRandomRGB(): RGB {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
}

function returnSetColors(): [string, string] {
  return ['#0284c7', '#034780'];
}

function getTwoDistinctColors(): [string, string] {
  const MIN_DISTANCE = 100; // Minimum color difference threshold
  const BLACK: RGB = { r: 0, g: 0, b: 0 };
  const WHITE: RGB = { r: 255, g: 255, b: 255 };

  let color1: RGB;
  let color2: RGB;
  let attempts = 0;
  const MAX_ATTEMPTS = 100;

  do {
    color1 = getRandomRGB();
    color2 = getRandomRGB();
    attempts++;

    // Check if colors are too similar to each other or to black/white
    const distanceBetweenColors = getColorDistance(color1, color2);
    const distanceFromBlack1 = getColorDistance(color1, BLACK);
    const distanceFromBlack2 = getColorDistance(color2, BLACK);
    const distanceFromWhite1 = getColorDistance(color1, WHITE);
    const distanceFromWhite2 = getColorDistance(color2, WHITE);

    if (
      distanceBetweenColors > MIN_DISTANCE &&
      distanceFromBlack1 > MIN_DISTANCE &&
      distanceFromBlack2 > MIN_DISTANCE &&
      distanceFromWhite1 > MIN_DISTANCE &&
      distanceFromWhite2 > MIN_DISTANCE
    ) {
      break;
    }
  } while (attempts < MAX_ATTEMPTS);

  return [rgbToHex(color1), rgbToHex(color2)];
}

interface FilterObject {
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

type DisplayNameMapping = {
  [K in keyof Omit<FilterObject, 'age'>]: string;
};

function formatFilters(filters: FilterObject): string {
  if (!filters || Object.keys(filters).length === 0) {
    return 'No filters applied';
  }

  const parts: string[] = [];

  // Handle age ranges
  if (filters.age && filters.age.length > 0) {
    const ages = [...new Set(filters.age)].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = ages[0];
    let prev = ages[0];

    for (let i = 1; i <= ages.length; i++) {
      if (i === ages.length || ages[i] !== prev + 1) {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        if (i < ages.length) {
          start = ages[i];
          prev = ages[i];
        }
      } else {
        prev = ages[i];
      }
    }
    parts.push(`Age: ${ranges.join(', ')}`);
  }

  // Map of filter keys to their display names
  const displayNames: DisplayNameMapping = {
    citizenship: 'Citizenship',
    employment: 'Employment',
    gender: 'Gender',
    income_bracket: 'Income Bracket',
    political_leaning: 'Political Leaning',
    political_party: 'Political Party',
    race_ethnicity: 'Race/Ethnicity',
    state: 'State',
  };

  // Format all other filters
  (Object.entries(filters) as [keyof FilterObject, string[]][])
    .filter(([key]) => key !== 'age')
    .forEach(([key, values]) => {
      if (values && values.length > 0) {
        const displayName = displayNames[key] || key;
        const formattedValues = values
          .map((value) =>
            value
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
          )
          .join(', ');
        parts.push(`${displayName}: ${formattedValues}`);
      }
    });

  return parts.join(' | ');
}
export {
  getTimeUntilExpiration,
  getTimeRemainingPercentage,
  addColorToResults,
  formatFilters,
};
