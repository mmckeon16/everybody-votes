-- migrations/20250117225600_add_expo_push_token.sql

-- Add expo push token column to users table
alter table users add column expo_push_token text;

-- Add an index to improve query performance when looking up tokens
create index idx_users_expo_push_token on users(expo_push_token);