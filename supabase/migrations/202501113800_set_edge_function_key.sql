-- migrations/[timestamp]_set_edge_function_key.sql

-- Set the database parameter using environment variable
alter database postgres 
  set "app.edge_function_key" = current_setting('app.jwt_secret');

-- Grant usage to authenticated users if needed
grant usage on schema net to authenticated;
grant all on all functions in schema net to authenticated;