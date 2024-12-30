export interface AgeRange {
  min: number;
  max: number;
}

export function parseAgeRanges(ranges: string[]): AgeRange[] {
  return ranges.map((range) => {
    if (range === '<18') {
      return { min: 1, max: 17 };
    }
    if (range.endsWith('+')) {
      const min = parseInt(range.replace('+', ''));
      return { min, max: 115 }; // Using 115 as max age as per your ageMapping
    }
    const [min, max] = range.split('-').map((num) => parseInt(num));
    return { min, max };
  });
}
