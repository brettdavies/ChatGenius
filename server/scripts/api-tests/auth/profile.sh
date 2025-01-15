#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Source auth functions
source "${SCRIPT_DIR}/../_common/auth.sh"

# First login to get user ID
echo "Logging in to get user ID..."
login "${TEST_USER1_EMAIL}" "${TEST_USER1_PASSWORD}"
user_id=$(get_user_id)

# Test successful profile retrieval
echo -e "\nTesting profile retrieval..."
response=$(curl -s -X GET \
  "${API_URL}/api/auth/me?userId=${user_id}" \
  -H "Content-Type: application/json")

if ! echo "$response" | jq -e '.user' > /dev/null; then
  echo "Profile retrieval failed. Response: $response"
  exit 1
fi

echo "Profile retrieval successful"

# Test missing user ID
echo -e "\nTesting missing user ID..."
response=$(curl -s -X GET \
  "${API_URL}/api/auth/me" \
  -H "Content-Type: application/json")

if ! echo "$response" | jq -e '.errors[0].message' | grep -q "must have required property 'userId'"; then
  echo "Expected OpenAPI validation error. Response: $response"
  exit 1
fi

echo "Missing user ID test passed"

# Test invalid user ID format
echo -e "\nTesting invalid user ID format..."
response=$(curl -s -X GET \
  "${API_URL}/api/auth/me?userId=invalid_id" \
  -H "Content-Type: application/json")

if ! echo "$response" | jq -e '.errors[0].message' | grep -q "must match pattern"; then
  echo "Expected OpenAPI validation error. Response: $response"
  exit 1
fi

echo "Invalid user ID format test passed"

# Test non-existent user ID
echo -e "\nTesting non-existent user ID..."
response=$(curl -s -X GET \
  "${API_URL}/api/auth/me?userId=01JHNY2HDW20X28NE7CX850ABC" \
  -H "Content-Type: application/json")

if ! echo "$response" | grep -q "User not found"; then
  echo "Expected user not found error. Response: $response"
  exit 1
fi

echo "Non-existent user ID test passed" 