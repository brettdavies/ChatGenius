#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Source auth functions
source "${SCRIPT_DIR}/../_common/auth.sh"

# Test successful registration
echo "Testing successful registration..."
response=$(curl -s -X POST \
  "${API_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "Password123!"
  }')

echo "$response" | jq '.'

# Extract and save user ID for subsequent tests
user_id=$(echo "$response" | jq -r '.user.id')
if [ "$user_id" != "null" ]; then
  save_user_id "$user_id"
fi

# Test duplicate email
echo -e "\nTesting duplicate email registration..."
response=$(curl -s -X POST \
  "${API_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser2",
    "password": "Password123!"
  }')

if ! echo "$response" | grep -q "Email already taken"; then
  echo "Expected duplicate email error. Response: $response"
  exit 1
fi

echo "Duplicate email test passed"

# Test invalid email format
echo -e "\nTesting invalid email format..."
response=$(curl -s -X POST \
  "${API_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "username": "newuser3",
    "password": "Password123!"
  }')

if ! echo "$response" | grep -q "Invalid request data"; then
  echo "Expected invalid email format error. Response: $response"
  exit 1
fi

echo "Invalid email format test passed"

# Clean up
clear_user_id 