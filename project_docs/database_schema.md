# Database Schema Documentation

## Table Structure

### example_table

Table Description: Example table demonstrating common schema patterns and best practices.

Default Sort: created_at DESC

Indexes:

- idx_example_table_name (name) - For fast lookups by name
- idx_example_table_parent_id (parent_id) - For efficient parent/child queries
- idx_example_table_status (status) - For status-based filtering

Triggers:

- before_insert_example_table: Sets created_at, updated_at
- before_update_example_table: Updates updated_at
- after_delete_example_table: Soft delete handling

| Column           | Type        | Description                                  | Key Type     | Constraints                                             | Default Value       | Example Value                   |
|-----------------|-------------|----------------------------------------------|-------------|--------------------------------------------------------|--------------------|---------------------------------|
| id              | VARCHAR(26) | Primary key (ULID)                           | Primary Key | UNIQUE, NOT NULL                                       | NULL               | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| name            | TEXT        | Unique identifier                            | Unique Key  | UNIQUE, NOT NULL                                       | NULL               | 'example-record-1'             |
| metadata        | JSONB       | Structured data                              | None        | NOT NULL                                               | '{}'               | '{"key": "value"}'             |
| parent_id       | UUID        | Self-referential foreign key                 | Foreign Key | FOREIGN KEY                                           | NULL               | '123e4567-e89b-12d3-a456-426614174000' |
| status          | TEXT        | Status with limited values                   | None        | CHECK (status IN ('draft', 'published', 'archived'))  | 'draft'            | 'published'                    |
| created_at      | TIMESTAMP   | Creation timestamp                           | None        | NOT NULL                                              | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00'          |
| updated_at      | TIMESTAMP   | Last update timestamp                        | None        | NOT NULL                                              | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00'          |
| deleted_at      | TIMESTAMP   | Deletion timestamp                           | None        | NULL                                                  | NULL               | '2024-03-14 12:00:00'          |

Foreign Key References:

- parent_id REFERENCES example_table(id) ON DELETE CASCADE

## Relationships

### One-to-One

### One-to-Many

### Many-to-Many

## Notes

- All timestamps are in UTC
- All tables should have a created_at, updated_at, and deleted_at column
- Updated_at should be set to the current timestamp by a trigger on every update
- Deleted_at should be set to the current timestamp by a trigger when a row is deleted
- Cascading deletes should be used when appropriate
- Foreign keys should have appropriate ON DELETE/UPDATE behaviors defined
- Consider indexing frequently queried columns
- Use appropriate constraints to maintain data integrity
- ULID: Universally Unique Lexicographically Sortable Identifier
- A ULID is a 26 character string that is lexicographically sortable
- A ULID is generated at the application layer
- JSONB fields allow flexible schema evolution

## Data Types

- UUID: Universally Unique Identifier
- VARCHAR(N): Variable-length character strings
- TEXT: Variable-length character strings
- BOOLEAN: True/false values
- INTEGER: Whole numbers
- DECIMAL/NUMERIC: Precise decimal numbers
- TIMESTAMP: Date and time (UTC)
- TIMESTAMPTZ: Date and time with timezone
- JSONB: Binary JSON data
- ARRAY: Array of other types
