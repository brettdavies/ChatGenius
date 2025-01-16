# Database Schema Documentation

## Table of Contents

- [Database Schema Documentation](#database-schema-documentation)
  - [Table of Contents](#table-of-contents)
  - [Table Structure](#table-structure)
    - [users](#users)
    - [channels](#channels)
    - [messages](#messages)
    - [reactions](#reactions)
    - [channel\_members](#channel_members)
    - [user\_settings](#user_settings)
    - [user\_status](#user_status)
    - [message\_reads](#message_reads)
  - [Relationships](#relationships)
    - [One-to-One](#one-to-one)
    - [One-to-Many](#one-to-many)
    - [Many-to-Many](#many-to-many)
  - [Notes](#notes)
  - [Data Types](#data-types)

---

## Table Structure

### users

Table Description: Stores user information and authentication details.

Default Sort: created_at DESC

Indexes:

- idx_users_email (email) - For fast lookups by email
- idx_users_username (username) - For username searches

Triggers:

- before_insert_users: Sets created_at, updated_at
- before_update_users: Updates updated_at

| Column           | Type          | Description                                  | Key Type     | Constraints                    | Default Value       | Example Value                   |
|-----------------|---------------|----------------------------------------------|-------------|--------------------------------|--------------------|---------------------------------|
| id              | VARCHAR(26)   | Primary key (ULID)                          | Primary Key | UNIQUE, NOT NULL               | NULL               | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| email           | VARCHAR(255)  | User's email address                        | Unique Key  | UNIQUE, NOT NULL               | NULL               | 'user@example.com'              |
| username        | VARCHAR(50)   | User's display name                         | None        | NOT NULL                       | NULL               | 'johndoe'                       |
| full_name       | VARCHAR(100)  | User's full name                           | None        | NULL                          | NULL               | 'John Doe'                      |
| avatar_url      | TEXT          | URL to user's avatar                        | None        | NULL                          | NULL               | 'https://example.com/avatar.jpg' |
| role            | VARCHAR(20)   | User's system role                         | None        | CHECK (role IN ('user', 'admin')) | 'user'          | 'admin'                         |
| created_at      | TIMESTAMPTZ   | Creation timestamp                          | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |
| updated_at      | TIMESTAMPTZ   | Last update timestamp                       | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |
| deleted_at      | TIMESTAMPTZ   | Deletion timestamp                          | None        | NULL                          | NULL               | '2024-03-14 12:00:00+00'        |

### channels

Table Description: Stores channel information for group conversations.

Default Sort: created_at DESC

Indexes:

- idx_channels_name (name) - For channel search
- idx_channels_type (type) - For filtering by channel type
- idx_channels_created_by (created_by) - For creator lookups

Triggers:

- before_insert_channels: Sets created_at, updated_at
- before_update_channels: Updates updated_at
- after_insert_channels: Creates channel_members entry for creator

| Column           | Type          | Description                                  | Key Type     | Constraints                                          | Default Value       | Example Value                   |
|-----------------|---------------|----------------------------------------------|-------------|-----------------------------------------------------|--------------------|---------------------------------|
| id              | VARCHAR(26)   | Primary key (ULID)                          | Primary Key | UNIQUE, NOT NULL                                     | NULL               | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| name            | VARCHAR(80)   | Channel name                                | None        | NOT NULL                                            | NULL               | 'general'                       |
| topic           | TEXT          | Channel topic/description                    | None        | NULL                                                | NULL               | 'General discussion'            |
| type            | VARCHAR(20)   | Channel type                                | None        | CHECK (type IN ('public', 'private', 'dm'))         | 'public'           | 'public'                        |
| created_by      | VARCHAR(26)   | User who created the channel                | Foreign Key | FOREIGN KEY (users.id), NOT NULL                    | NULL               | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| created_at      | TIMESTAMPTZ   | Creation timestamp                          | None        | NOT NULL                                            | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |
| updated_at      | TIMESTAMPTZ   | Last update timestamp                       | None        | NOT NULL                                            | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |
| deleted_at      | TIMESTAMPTZ   | Deletion timestamp                          | None        | NULL                                                | NULL               | '2024-03-14 12:00:00+00'        |

Foreign Key References:

- created_by REFERENCES users(id) ON DELETE RESTRICT

### messages

Table Description: Stores all messages sent in channels or direct messages.

Default Sort: created_at DESC

Indexes:

- idx_messages_channel_id (channel_id) - For channel message lookups
- idx_messages_user_id (user_id) - For user message lookups
- idx_messages_thread_id (thread_id) - For thread message lookups
- idx_messages_created_at (created_at) - For time-based queries

Triggers:

- before_insert_messages: Sets created_at, updated_at
- before_update_messages: Updates updated_at
- after_insert_messages: Notifies channel subscribers
- after_update_messages: Notifies channel subscribers

| Column           | Type          | Description                                  | Key Type     | Constraints                    | Default Value       | Example Value                   |
|-----------------|---------------|----------------------------------------------|-------------|--------------------------------|--------------------|---------------------------------|
| id              | VARCHAR(26)   | Primary key (ULID)                          | Primary Key | UNIQUE, NOT NULL               | NULL               | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| channel_id      | VARCHAR(26)   | Channel where message was sent              | Foreign Key | FOREIGN KEY (channels.id), NOT NULL | NULL          | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| user_id         | VARCHAR(26)   | User who sent the message                   | Foreign Key | FOREIGN KEY (users.id), NOT NULL | NULL            | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| content         | TEXT          | Message content                             | None        | NOT NULL                       | NULL               | 'Hello, world!'                 |
| thread_id       | VARCHAR(26)   | Parent message if in thread                 | Foreign Key | FOREIGN KEY (messages.id)      | NULL               | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| edited          | BOOLEAN       | Whether message has been edited             | None        | NOT NULL                       | FALSE              | TRUE                            |
| created_at      | TIMESTAMPTZ   | Creation timestamp                          | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |
| updated_at      | TIMESTAMPTZ   | Last update timestamp                       | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |
| deleted_at      | TIMESTAMPTZ   | Deletion timestamp                          | None        | NULL                          | NULL               | '2024-03-14 12:00:00+00'        |

Foreign Key References:

- channel_id REFERENCES channels(id) ON DELETE CASCADE
- user_id REFERENCES users(id) ON DELETE RESTRICT
- thread_id REFERENCES messages(id) ON DELETE CASCADE

### reactions

Table Description: Stores emoji reactions to messages.

Default Sort: created_at DESC

Indexes:

- idx_reactions_message_id (message_id) - For message reaction lookups
- idx_reactions_user_id (user_id) - For user reaction lookups
- idx_reactions_emoji (emoji) - For emoji-based queries

Triggers:

- before_insert_reactions: Sets created_at
- after_insert_reactions: Notifies channel subscribers
- after_delete_reactions: Notifies channel subscribers

| Column           | Type          | Description                                  | Key Type     | Constraints                    | Default Value       | Example Value                   |
|-----------------|---------------|----------------------------------------------|-------------|--------------------------------|--------------------|---------------------------------|
| id              | VARCHAR(26)   | Primary key (ULID)                          | Primary Key | UNIQUE, NOT NULL               | NULL               | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| message_id      | VARCHAR(26)   | Message being reacted to                    | Foreign Key | FOREIGN KEY (messages.id), NOT NULL | NULL          | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| user_id         | VARCHAR(26)   | User who reacted                           | Foreign Key | FOREIGN KEY (users.id), NOT NULL | NULL            | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| emoji           | VARCHAR(32)   | Unicode emoji character                     | None        | NOT NULL                       | NULL               | '👍'                            |
| created_at      | TIMESTAMPTZ   | Creation timestamp                          | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |

Foreign Key References:

- message_id REFERENCES messages(id) ON DELETE CASCADE
- user_id REFERENCES users(id) ON DELETE CASCADE

### channel_members

Table Description: Stores channel membership information.

Default Sort: created_at DESC

Indexes:

- idx_channel_members_channel_id (channel_id) - For channel member lookups
- idx_channel_members_user_id (user_id) - For user channel lookups
- idx_channel_members_role (role) - For role-based queries

Triggers:

- before_insert_channel_members: Sets created_at, updated_at
- before_update_channel_members: Updates updated_at
- after_insert_channel_members: Notifies channel subscribers
- after_delete_channel_members: Notifies channel subscribers

| Column           | Type          | Description                                  | Key Type     | Constraints                    | Default Value       | Example Value                   |
|-----------------|---------------|----------------------------------------------|-------------|--------------------------------|--------------------|---------------------------------|
| id              | VARCHAR(26)   | Primary key (ULID)                          | Primary Key | UNIQUE, NOT NULL               | NULL               | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| channel_id      | VARCHAR(26)   | Channel being joined                        | Foreign Key | FOREIGN KEY (channels.id), NOT NULL | NULL          | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| user_id         | VARCHAR(26)   | User joining channel                        | Foreign Key | FOREIGN KEY (users.id), NOT NULL | NULL            | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| role            | VARCHAR(20)   | User's role in channel                      | None        | CHECK (role IN ('owner', 'admin', 'member')) | 'member' | 'admin'                        |
| created_at      | TIMESTAMPTZ   | Creation timestamp                          | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |
| updated_at      | TIMESTAMPTZ   | Last update timestamp                       | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |
| deleted_at      | TIMESTAMPTZ   | Deletion timestamp                          | None        | NULL                          | NULL               | '2024-03-14 12:00:00+00'        |

Foreign Key References:

- channel_id REFERENCES channels(id) ON DELETE CASCADE
- user_id REFERENCES users(id) ON DELETE CASCADE

### user_settings

Table Description: Stores user preferences and settings.

Default Sort: created_at DESC

Indexes:

- idx_user_settings_user_id (user_id) - For user settings lookups

Triggers:

- before_insert_user_settings: Sets created_at, updated_at
- before_update_user_settings: Updates updated_at

| Column           | Type          | Description                                  | Key Type     | Constraints                    | Default Value       | Example Value                   |
|-----------------|---------------|----------------------------------------------|-------------|--------------------------------|--------------------|---------------------------------|
| id              | VARCHAR(26)   | Primary key (ULID)                          | Primary Key | UNIQUE, NOT NULL               | NULL               | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| user_id         | VARCHAR(26)   | User these settings belong to               | Foreign Key | FOREIGN KEY (users.id), NOT NULL | NULL            | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| theme           | VARCHAR(20)   | UI theme preference                         | None        | CHECK (theme IN ('light', 'dark')) | 'light'        | 'dark'                         |
| notifications   | JSONB         | Notification preferences                     | None        | NOT NULL                       | '{}'               | '{"desktop":true,"email":false}' |
| muted_channels  | VARCHAR(26)[] | Array of muted channel IDs                  | None        | NULL                          | NULL               | ['01H5XZK...', '01H5XZK...']    |
| created_at      | TIMESTAMPTZ   | Creation timestamp                          | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |
| updated_at      | TIMESTAMPTZ   | Last update timestamp                       | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |

Foreign Key References:

- user_id REFERENCES users(id) ON DELETE CASCADE

### user_status

Table Description: Stores user presence and status information.

Default Sort: created_at DESC

Indexes:

- idx_user_status_user_id (user_id) - For user status lookups
- idx_user_status_presence (presence) - For presence filtering

Triggers:

- before_insert_user_status: Sets created_at, updated_at
- before_update_user_status: Updates updated_at
- after_update_user_status: Notifies channel subscribers

| Column           | Type          | Description                                  | Key Type     | Constraints                    | Default Value       | Example Value                   |
|-----------------|---------------|----------------------------------------------|-------------|--------------------------------|--------------------|---------------------------------|
| id              | VARCHAR(26)   | Primary key (ULID)                          | Primary Key | UNIQUE, NOT NULL               | NULL               | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| user_id         | VARCHAR(26)   | User this status belongs to                 | Foreign Key | FOREIGN KEY (users.id), NOT NULL | NULL            | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| presence        | VARCHAR(20)   | User's presence state                       | None        | CHECK (presence IN ('online', 'away', 'offline')) | 'offline' | 'online'                      |
| status_text     | VARCHAR(100)  | Custom status message                       | None        | NULL                          | NULL               | 'In a meeting'                  |
| status_emoji    | VARCHAR(32)   | Status emoji                                | None        | NULL                          | NULL               | '📅'                            |
| status_expiry   | TIMESTAMPTZ   | When status should expire                   | None        | NULL                          | NULL               | '2024-03-14 13:00:00+00'        |
| created_at      | TIMESTAMPTZ   | Creation timestamp                          | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |
| updated_at      | TIMESTAMPTZ   | Last update timestamp                       | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |

Foreign Key References:

- user_id REFERENCES users(id) ON DELETE CASCADE

### message_reads

Table Description: Stores message read states and unread indicators.

Default Sort: created_at DESC

Indexes:

- idx_message_reads_user_id (user_id) - For user message read lookups
- idx_message_reads_channel_id (channel_id) - For channel message read lookups
- idx_message_reads_last_read_message_id (last_read_message_id) - For last read message lookups

Triggers:

- before_insert_message_reads: Sets created_at, updated_at
- before_update_message_reads: Updates updated_at

| Column           | Type          | Description                                  | Key Type     | Constraints                    | Default Value       | Example Value                   |
|-----------------|---------------|----------------------------------------------|-------------|--------------------------------|--------------------|---------------------------------|
| id              | VARCHAR(26)   | Primary key (ULID)                          | Primary Key | UNIQUE, NOT NULL               | NULL               | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| user_id         | VARCHAR(26)   | User this read state belongs to             | Foreign Key | FOREIGN KEY (users.id), NOT NULL | NULL            | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| channel_id      | VARCHAR(26)   | Channel this read state belongs to         | Foreign Key | FOREIGN KEY (channels.id), NOT NULL | NULL          | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| last_read_message_id | VARCHAR(26)   | Last read message ID                       | Foreign Key | FOREIGN KEY (messages.id), NOT NULL | NULL          | '01H5XZK6J3V2857AWC8C9M5DQ3'    |
| created_at      | TIMESTAMPTZ   | Creation timestamp                          | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |
| updated_at      | TIMESTAMPTZ   | Last update timestamp                       | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-03-14 12:00:00+00'        |

Foreign Key References:

- user_id REFERENCES users(id) ON DELETE CASCADE
- channel_id REFERENCES channels(id) ON DELETE CASCADE
- last_read_message_id REFERENCES messages(id) ON DELETE CASCADE

## Relationships

### One-to-One

- User -> UserSettings
- User -> UserStatus

### One-to-Many

- User -> Messages
- Channel -> Messages
- Message -> Reactions
- Message -> ThreadMessages (self-referential)

### Many-to-Many

- Users <-> Channels (through channel_members)

## Notes

- All timestamps are in UTC
- All tables use TIMESTAMPTZ for proper timezone handling
- All tables have created_at and updated_at columns
- Most tables support soft delete with deleted_at
- ULIDs are used as primary keys for lexicographical sorting
- Foreign keys have appropriate ON DELETE behaviors
- Indexes are added for frequently queried columns
- Appropriate constraints maintain data integrity
- JSONB fields allow flexible schema evolution
- Array types are used where appropriate (e.g., muted_channels)
- Triggers handle timestamps and notifications
- PostgreSQL NOTIFY/LISTEN is used for real-time updates

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
