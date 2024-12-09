Here's a comprehensive guide for working with Supabase:

# Supabase Development Guide

## Initial Setup

1. **Install Supabase CLI**

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

2. **Login to Supabase**

```bash
supabase login
```

3. **Initialize Project**

**only run this when setting up the project, not if you are just cloning it**

```bash
supabase init
```

## Local Development

### Starting/Stopping Supabase

```bash
# Start all services
supabase start

# Stop all services
supabase stop

# Check status
supabase status
```

### Database Management

1. **Create a Migration**

```bash
# Create a new migration file
supabase migration new my_migration_name
```

2. **Migration File Example**

```sql:supabase/migrations/[timestamp]_my_migration.sql
-- Create a new table
CREATE TABLE public.my_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a column
ALTER TABLE public.my_table ADD COLUMN name TEXT;
```

3. **Apply Migrations**

```bash
# Reset local database and apply all migrations
supabase db reset

# Check migration status
supabase db diff
```

4. **Connecting to Local Database**

```bash
# Using psql (default credentials)
psql postgresql://postgres:postgres@localhost:54322/postgres

# Useful psql commands
\dt public.*         -- List all tables
\d public.table_name -- Describe table
\q                   -- Quit psql
```

### Edge Functions

1. **Create a New Function**

```bash
supabase functions new my-function
```

2. **Function Structure**

```typescript:supabase/functions/my-function/index.ts
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Your function logic here
    return new Response(JSON.stringify({ message: 'Success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

3. **CORS Setup**

```typescript:supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
```

4. **Local Function Development**

```bash
# Serve all functions
supabase functions serve

# Serve with debug output
supabase functions serve --debug
```

## Deployment

### Deploy Database Changes

```bash
# Push migrations to production
supabase db push

# If something goes wrong
supabase db reset  # Locally only
```

### Deploy Functions

```bash
# Deploy a specific function
supabase functions deploy my-function

# Deploy all functions
supabase functions deploy
```

## Debugging

### Database

```bash
# Check table structure
psql postgresql://postgres:postgres@localhost:54322/postgres -c "\d public.table_name"

# View migration status
supabase db diff

# Check service status
supabase status
```

### Functions

```bash
# View function logs
supabase functions serve --debug

# Test function locally
curl -i --location --request POST 'http://localhost:54321/functions/v1/my-function' \
  --header 'Authorization: Bearer ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'
```

## Best Practices

1. **Database**

   - Always use migrations for schema changes
   - Version control your migrations
   - Test migrations locally before deploying
   - Use meaningful names for migrations

2. **Functions**

   - Always handle CORS
   - Include proper error handling
   - Use TypeScript for better type safety
   - Keep functions focused and small

3. **Development Workflow**

   - Start with `supabase start`
   - Make changes locally
   - Test thoroughly
   - Deploy using CLI commands
   - Monitor logs for issues

4. **Environment Variables**
   - Use `.env` for local development
   - Never commit sensitive credentials
   - Use different keys for development/production

## Common Issues

1. **CORS Errors**

   - Ensure corsHeaders are properly set
   - Check function response headers
   - Verify client-side request headers

2. **Database Connection Issues**

   - Check if Supabase is running (`supabase status`)
   - Verify connection credentials
   - Ensure migrations are applied (`supabase db reset`)

3. **Function Deployment Failures**
   - Check function syntax
   - Verify dependencies
   - Review deployment logs

Remember to always check the [official Supabase documentation](https://supabase.com/docs) for the most up-to-date information and best practices.
