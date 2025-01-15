#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

# Source common setup
source "${SCRIPT_DIR}/_common/setup.sh"

# Run test scripts
cd "${SCRIPT_DIR}"
pwd
echo "Running test scripts..."
for test_script in auth/*.sh; do
  echo "Running test: $(basename "$test_script")"
  bash "$test_script"
  
  if [ $? -ne 0 ]; then
    echo "Test failed: $(basename "$test_script")"
    exit 1
  fi
done

# Clean up test schema
echo "Cleaning up schema ${SCHEMA_NAME}..."
psql "${DATABASE_URL}" -c "DROP SCHEMA IF EXISTS ${SCHEMA_NAME} CASCADE;" 