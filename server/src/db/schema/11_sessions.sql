-- Sessions table for storing user sessions
CREATE TABLE sessions (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL,
  CONSTRAINT sessions_pkey PRIMARY KEY (sid)
);

-- Index for session expiry cleanup
CREATE INDEX idx_sessions_expire ON sessions (expire); 