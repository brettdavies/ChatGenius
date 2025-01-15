#!/bin/bash

# Get the directory of the current script
COMMON_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "${COMMON_DIR}/../../.." && pwd )"

# Source environment variables
source "${COMMON_DIR}/env.sh"

# Set test environment
export NODE_ENV=test

# Kill any existing node processes
echo "Cleaning up existing processes..."
pkill -f "node.*vite" || true
sleep 2

# Generate unique schema name for this test run
export SCHEMA_NAME="test_api_$(date +%s)"
echo "Using test schema: ${SCHEMA_NAME}"

# Function to wait for server to be ready
wait_for_server() {
  echo "Waiting for server to be ready..."
  for i in {1..30}; do
    if curl -s "${API_URL}/health" > /dev/null; then
      echo "Server is ready!"
      return 0
    fi
    sleep 1
  done
  echo "Server failed to start"
  exit 1
}

# Start the server with test schema
echo "Starting test server..."
cd "${ROOT_DIR}" && NODE_ENV=test SCHEMA_NAME="${SCHEMA_NAME}" npm run dev & SERVER_PID=$!

# Wait for server to be ready
wait_for_server

# Run migrations with schema name
echo "Running migrations..."
cd "${ROOT_DIR}" && SCHEMA_NAME="${SCHEMA_NAME}" NODE_ENV=test npm run migrate

# Create test users
echo "Creating test users..."

# Create test user 1
echo "Creating test user 1..."
response=$(curl -s -X POST \
  "${API_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${TEST_USER1_USERNAME}\",
    \"email\": \"${TEST_USER1_EMAIL}\",
    \"password\": \"${TEST_USER1_PASSWORD}\"
  }")
echo "Response for test user 1: $response"

# Create test user 2
echo "Creating test user 2..."
response=$(curl -s -X POST \
  "${API_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${TEST_USER2_USERNAME}\",
    \"email\": \"${TEST_USER2_EMAIL}\",
    \"password\": \"${TEST_USER2_PASSWORD}\"
  }")
echo "Response for test user 2: $response"

echo "Test data setup complete!"

# Cleanup function
cleanup() {
  echo "Cleaning up..."
  kill $SERVER_PID 2>/dev/null || true
  pkill -f "node.*vite" || true
}

# Set up cleanup on script exit
trap cleanup EXIT 