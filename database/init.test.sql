-- Create and use test schema
DROP SCHEMA IF EXISTS test CASCADE;
CREATE SCHEMA test;
SET search_path TO test;

-- Create extensions in test schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA test;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA test;
CREATE EXTENSION IF NOT EXISTS "citext" SCHEMA test;

-- Drop all tables first to ensure clean state
DROP TABLE IF EXISTS test.users CASCADE;
DROP TABLE IF EXISTS test.channels CASCADE;
DROP TABLE IF EXISTS test.messages CASCADE;

-- Create users table
CREATE TABLE test.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create channels table
CREATE TABLE test.channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES test.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE test.messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    channel_id INTEGER REFERENCES test.channels(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES test.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 