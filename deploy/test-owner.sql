-- Disposable integration fixture, never used by the Render deployment.
CREATE ROLE render_owner LOGIN PASSWORD 'local-test-owner-password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
ALTER DATABASE polls_test OWNER TO render_owner;
