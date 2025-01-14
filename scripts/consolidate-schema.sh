#!/bin/bash

# Directory containing this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Path to the schema directory and init.sql
SCHEMA_DIR="$SCRIPT_DIR/../server/src/db/schema"
INIT_SQL="$SCRIPT_DIR/../database/init.sql"

# Create or clear init.sql
echo "-- Auto-generated from schema files" > "$INIT_SQL"
echo "-- Generated on $(date)" >> "$INIT_SQL"
echo "" >> "$INIT_SQL"

# Find all .sql files in schema directory, sort them numerically
find "$SCHEMA_DIR" -name "*.sql" | sort | while read -r file; do
    echo "-- Including $(basename "$file")" >> "$INIT_SQL"
    echo "" >> "$INIT_SQL"
    cat "$file" >> "$INIT_SQL"
    echo "" >> "$INIT_SQL"
    echo "" >> "$INIT_SQL"
done

echo "Schema consolidation complete. Output written to $INIT_SQL" 