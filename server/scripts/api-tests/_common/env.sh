#!/bin/bash

# Force test environment
export NODE_ENV="test"
export API_URL="${API_URL:-http://localhost:5000}"

# Test data configuration
export TEST_USER1_USERNAME="testuser1"
export TEST_USER1_EMAIL="testuser1@example.com"
export TEST_USER1_PASSWORD="Password123!"
export TEST_USER2_USERNAME="testuser2"
export TEST_USER2_EMAIL="testuser2@example.com"
export TEST_USER2_PASSWORD="Password123!"

# Get the absolute path to the server directory
COMMON_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(cd "${COMMON_DIR}/../../.." && pwd)"

# Load test environment variables
if [ -f "${SERVER_DIR}/.env.test" ]; then
  set -a  # automatically export all variables
  source "${SERVER_DIR}/.env.test"
  set +a  # stop automatically exporting
else
  echo "Error: .env.test file not found at ${SERVER_DIR}/.env.test"
  exit 1
fi

# Set test schema
export SCHEMA_NAME="test_api_$(date +%s)"

# Construct database URL with schema
if [ -z "${DATABASE_URL}" ]; then
  export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
fi

# Common utility functions
function check_response() {
  if [ $? -ne 0 ]; then
    echo "Error: API request failed"
    exit 1
  fi
}

function require_jq() {
  if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed"
    exit 1
  fi
}

function require_psql() {
  if ! command -v psql &> /dev/null; then
    echo "Error: psql is required but not installed"
    exit 1
  fi
}

function setup_schema() {
  echo "Creating test schema ${SCHEMA_NAME}..."
  psql "${DATABASE_URL}" << EOF
    DROP SCHEMA IF EXISTS ${SCHEMA_NAME} CASCADE;
    CREATE SCHEMA ${SCHEMA_NAME};
    SET search_path TO ${SCHEMA_NAME};
EOF
}

function cleanup_schema() {
  echo "Cleaning up schema ${SCHEMA_NAME}..."
  psql "${DATABASE_URL}" << EOF
    DROP SCHEMA IF EXISTS ${SCHEMA_NAME} CASCADE;
EOF
}

# Check required tools
require_jq
require_psql 