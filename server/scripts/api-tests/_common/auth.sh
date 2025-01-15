#!/bin/bash

# Get the directory of the current script
COMMON_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$COMMON_DIR/env.sh"

# User ID storage
USER_ID_FILE="/tmp/chatgenius_user_id"

function get_user_id() {
  if [ -f "$USER_ID_FILE" ]; then
    cat "$USER_ID_FILE"
  else
    echo ""
  fi
}

function save_user_id() {
  echo "$1" > "$USER_ID_FILE"
}

function clear_user_id() {
  rm -f "$USER_ID_FILE"
}

function login() {
  local email="$1"
  local password="$2"

  echo "Attempting login with email: $email" >&2
  
  response=$(curl -s -X POST \
    "${API_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"${email}\",
      \"password\": \"${password}\"
    }")

  echo "Login response: $response" >&2

  # Extract user ID from response
  user_id=$(echo "$response" | jq -r '.user.id')
  if [ "$user_id" != "null" ] && [ "$user_id" != "" ]; then
    save_user_id "$user_id"
    echo "$response"
  else
    echo "Error: Login failed" >&2
    echo "$response" >&2
    exit 1
  fi
}

function register() {
  local username="$1"
  local email="$2"
  local password="$3"

  response=$(curl -s -X POST \
    "${API_URL}/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"${username}\",
      \"email\": \"${email}\",
      \"password\": \"${password}\"
    }")

  # Extract user ID from response
  user_id=$(echo "$response" | jq -r '.user.id')
  if [ "$user_id" != "null" ] && [ "$user_id" != "" ]; then
    save_user_id "$user_id"
    echo "$response"
  else
    echo "Error: Registration failed" >&2
    echo "$response" >&2
    exit 1
  fi
}

function get_profile() {
  local user_id=$(get_user_id)
  if [ -z "$user_id" ]; then
    echo "Error: Not authenticated" >&2
    exit 1
  fi

  curl -s -X GET \
    "${API_URL}/api/auth/me?userId=${user_id}" \
    -H "Content-Type: application/json"
}

function logout() {
  clear_user_id
}

function auth_param() {
  user_id=$(get_user_id)
  if [ -n "$user_id" ]; then
    echo "?userId=${user_id}"
  fi
} 