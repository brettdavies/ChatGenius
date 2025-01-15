#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Source auth functions
source "${SCRIPT_DIR}/../_common/auth.sh"

# Test valid login
echo "Testing valid login..."
response=$(curl -s -X POST \
  "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_USER1_EMAIL}\",
    \"password\": \"${TEST_USER1_PASSWORD}\"
  }")

if ! echo "$response" | jq -e '.user.id' > /dev/null; then
  echo "Login failed. Response: $response"
  exit 1
fi

echo "Login successful"

# Test invalid password
echo "Testing invalid password..."
response=$(curl -s -X POST \
  "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_USER1_EMAIL}\",
    \"password\": \"wrongpassword\"
  }")

if ! echo "$response" | grep -q "Invalid email or password"; then
  echo "Expected invalid credentials error. Response: $response"
  exit 1
fi

echo "Invalid password test passed"

# Test non-existent user
echo "Testing non-existent user..."
response=$(curl -s -X POST \
  "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "Password123!"
  }')

if ! echo "$response" | grep -q "Invalid email or password"; then
  echo "Expected invalid credentials error. Response: $response"
  exit 1
fi

echo "Non-existent user test passed" 