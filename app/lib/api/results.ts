const baseUrl =
  process.env.EXPO_PUBLIC_ENV === 'development'
    ? 'http://127.0.0.1:54321/functions/v1'
    : process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1';

// result-data/${questionId}
export const resultsApi = {
  getResultsForQuestion: async (
    questionId: string,
    demographicFilters?: {
      age?: string | string[];
      gender?: string | string[];
      country_residence?: string | string[];
      race_ethnicity?: string | string[];
      income_bracket?: string | string[];
      political_affiliation?: string | string[];
      occupation?: string | string[];
      country_origin?: string | string[];
    }
  ) => {
    const url = new URL(`${baseUrl}/result-data/${questionId}`);

    // Add demographic filters to query params if they exist
    if (demographicFilters) {
      Object.entries(demographicFilters).forEach(([key, value]) => {
        if (value) {
          // Handle both single values and arrays
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, v));
          } else {
            url.searchParams.append(key, value);
          }
        }
      });
    }
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });
    const data = await response.json();
    return {
      data,
    };
  },
};
export default resultsApi;
