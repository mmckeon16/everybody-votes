export const isDevelopmentEnvironment = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  console.log('SUPABASE_URL:', supabaseUrl);

  const isDevelopment =
    supabaseUrl?.includes('localhost') ||
    supabaseUrl?.includes('127.0.0.1') ||
    supabaseUrl?.includes('kong');

  console.log('Is Development?', isDevelopment);
  return isDevelopment;
};
