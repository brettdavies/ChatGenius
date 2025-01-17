# Database Schema Documentation

## Table of Contents

- [Database Schema Documentation](#database-schema-documentation)
  - [Table of Contents](#table-of-contents)
  - [Table Structure](#table-structure)
    - [users](#users)
    - [channels](#channels)
    - [channel\_members](#channel_members)
    - [messages](#messages)
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

- update_users_updated_at: Updates updated_at on change

| Column           | Type          | Description                                  | Key Type     | Constraints                    | Default Value       | Example Value                   |
|-----------------|---------------|----------------------------------------------|-------------|--------------------------------|--------------------|--------------------------------|
| id              | VARCHAR(26)   | Primary key (ULID)                          | Primary Key | UNIQUE, NOT NULL               | NULL               | '01HGW1J4ZNVN1WRMZ048MVQH2X'    |
| username        | VARCHAR(50)   | User's display name                         | Unique      | UNIQUE, NOT NULL               | NULL               | 'johndoe'                      |
| email           | VARCHAR(255)  | User's email address                        | Unique      | UNIQUE, NOT NULL               | NULL               | 'john.doe@example.com'          |
| password        | VARCHAR(255)  | Hashed password                            | None        | NOT NULL                       | NULL               | '$2b$10$X9zVj4z8...'              |
| role            | VARCHAR(20)   | User's system role                         | None        | NOT NULL                       | 'user'             | 'admin'                        |
| created_at      | TIMESTAMPTZ   | Creation timestamp                          | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-01-15 08:30:00+00'       |
| updated_at      | TIMESTAMPTZ   | Last update timestamp                       | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-01-15 09:45:00+00'       |
| deleted_at      | TIMESTAMPTZ   | Deletion timestamp                          | None        | NULL                          | NULL               | '2024-01-16 12:00:00+00'       |

### channels

Table Description: Stores channel information for group conversations.

Default Sort: created_at DESC

Indexes:

- idx_channels_name (name) - For channel search
- idx_channels_type (type) - For filtering by channel type
- idx_channels_created_by (created_by) - For creator lookups
- idx_channels_archived_at (archived_at) - For active channels

Triggers:

- update_channels_updated_at: Updates updated_at on change
- prevent_archived_channel_updates: Prevents updates to archived channels

| Column           | Type          | Description                                  | Key Type     | Constraints                                          | Default Value       | Example Value                   |
|-----------------|---------------|----------------------------------------------|-------------|-----------------------------------------------------|--------------------|---------------------------------|
| id              | VARCHAR(26)   | Primary key (ULID)                          | Primary Key | UNIQUE, NOT NULL                                     | NULL               | '01HGW1J4ZNVN1WRMZ048MVQH2X'    |
| name            | VARCHAR(80)   | Channel name                                | None        | NOT NULL                                            | NULL               | 'general'                       |
| description     | TEXT          | Channel description                         | None        | NULL                                                | NULL               | 'General discussion channel'    |
| type            | VARCHAR(20)   | Channel type                                | None        | CHECK (type IN ('public', 'private', 'dm'))         | NULL               | 'public'                        |
| created_by      | VARCHAR(26)   | User who created the channel                | Foreign Key | FOREIGN KEY (users.id), NOT NULL                    | NULL               | '01HGW1J4ZNVN1WRMZ048MVQH2X'    |
| created_at      | TIMESTAMPTZ   | Creation timestamp                          | None        | NOT NULL                                            | CURRENT_TIMESTAMP  | '2024-01-15 08:30:00+00'       |
| archived_at     | TIMESTAMPTZ   | When channel was archived                   | None        | NULL                                                | NULL               | '2024-01-20 16:45:00+00'       |
| archived_by     | VARCHAR(26)   | User who archived the channel               | Foreign Key | FOREIGN KEY (users.id)                              | NULL               | '01HGW1J4ZNVN1WRMZ048MVQH2X'    |
| updated_at      | TIMESTAMPTZ   | Last update timestamp                       | None        | NOT NULL                                            | CURRENT_TIMESTAMP  | '2024-01-15 09:45:00+00'       |
| deleted_at      | TIMESTAMPTZ   | Deletion timestamp                          | None        | NULL                                                | NULL               | '2024-01-20 16:45:00+00'       |

Foreign Key References:

- created_by REFERENCES users(id) ON DELETE RESTRICT
- archived_by REFERENCES users(id) ON DELETE RESTRICT

### channel_members

Table Description: Stores channel membership information.

Default Sort: created_at DESC

Indexes:

- idx_channel_members_channel_id (channel_id) - For channel member lookups
- idx_channel_members_user_id (user_id) - For user channel lookups
- idx_channel_members_role (role) - For role-based queries

Triggers:

- update_channel_members_updated_at: Updates updated_at on change
- notify_channel_member_change: Notifies on membership changes

| Column           | Type          | Description                                  | Key Type     | Constraints                    | Default Value       | Example Value                   |
|-----------------|---------------|----------------------------------------------|-------------|--------------------------------|--------------------|--------------------------------|
| id              | VARCHAR(26)   | Primary key (ULID)                          | Primary Key | UNIQUE, NOT NULL               | NULL               | '01HGW1J4ZNVN1WRMZ048MVQH2X'    |
| channel_id      | VARCHAR(26)   | Channel being joined                        | Foreign Key | FOREIGN KEY (channels.id), NOT NULL | NULL          | '01HGW1J4ZNVN1WRMZ048MVQH2X'    |
| user_id         | VARCHAR(26)   | User joining channel                        | Foreign Key | FOREIGN KEY (users.id), NOT NULL | NULL            | '01HGW1J4ZNVN1WRMZ048MVQH2X'    |
| role            | VARCHAR(20)   | User's role in channel                      | None        | CHECK (role IN ('owner', 'admin', 'member')) | NULL | 'owner'                        |
| created_at      | TIMESTAMPTZ   | Creation timestamp                          | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-01-15 08:30:00+00'       |
| updated_at      | TIMESTAMPTZ   | Last update timestamp                       | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-01-15 09:45:00+00'       |
| deleted_at      | TIMESTAMPTZ   | Deletion timestamp                          | None        | NULL                          | NULL               | '2024-01-16 12:00:00+00'       |

Foreign Key References:

- channel_id REFERENCES channels(id) ON DELETE CASCADE
- user_id REFERENCES users(id) ON DELETE CASCADE

### messages

Table Description: Stores all messages sent in channels or direct messages.

Default Sort: created_at DESC

Indexes:

- idx_messages_channel_id (channel_id) - For channel message lookups
- idx_messages_user_id (user_id) - For user message lookups
- idx_messages_thread_id (thread_id) - For thread message lookups
- idx_messages_created_at (created_at) - For time-based queries

Triggers:

- update_messages_updated_at: Updates updated_at on change
- notify_message_change: Notifies on message changes

| Column           | Type          | Description                                  | Key Type     | Constraints                    | Default Value       | Example Value                   |
|-----------------|---------------|----------------------------------------------|-------------|--------------------------------|--------------------|--------------------------------|
| id              | VARCHAR(26)   | Primary key (ULID)                          | Primary Key | UNIQUE, NOT NULL               | NULL               | '01HGW1J4ZNVN1WRMZ048MVQH2X'    |
| channel_id      | VARCHAR(26)   | Channel where message was sent              | Foreign Key | FOREIGN KEY (channels.id), NOT NULL | NULL          | '01HGW1J4ZNVN1WRMZ048MVQH2X'    |
| user_id         | VARCHAR(26)   | User who sent the message                   | Foreign Key | FOREIGN KEY (users.id), NOT NULL | NULL            | '01HGW1J4ZNVN1WRMZ048MVQH2X'    |
| content         | TEXT          | Message content                             | None        | NOT NULL                       | NULL               | 'Hello everyone! 👋'            |
| thread_id       | VARCHAR(26)   | Parent message if in thread                 | Foreign Key | FOREIGN KEY (messages.id)      | NULL               | '01HGW1J4ZNVN1WRMZ048MVQH2X'    |
| reactions       | JSONB         | Message reactions                           | None        | NOT NULL                       | '{}'               | '{"👍":["user1","user2"]}'      |
| edited          | BOOLEAN       | Whether message has been edited             | None        | NOT NULL                       | FALSE              | true                           |
| created_at      | TIMESTAMPTZ   | Creation timestamp                          | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-01-15 08:30:00+00'       |
| updated_at      | TIMESTAMPTZ   | Last update timestamp                       | None        | NOT NULL                       | CURRENT_TIMESTAMP  | '2024-01-15 09:45:00+00'       |
| deleted_at      | TIMESTAMPTZ   | Deletion timestamp                          | None        | NULL                          | NULL               | '2024-01-16 12:00:00+00'       |

Foreign Key References:

- channel_id REFERENCES channels(id) ON DELETE CASCADE
- user_id REFERENCES users(id) ON DELETE RESTRICT
- thread_id REFERENCES messages(id) ON DELETE CASCADE

## Relationships

### One-to-One

[[ None defined in schema ]]

### One-to-Many

- User -> Messages (user can have many messages)
- User -> Channels (user can create many channels)
- Channel -> Messages (channel contains many messages)
- Message -> Messages (message can have many thread replies)
- User -> ChannelArchives (user can archive many channels) [through archived_by]

### Many-to-Many

- Users <-> Channels (through channel_members, with role attribute)

## Notes

- All timestamps are in UTC
- All tables use TIMESTAMPTZ for proper timezone handling
- All tables have created_at and updated_at columns
- Most tables support soft delete with deleted_at
- ULIDs are used as primary keys for lexicographical sorting
- Foreign keys have appropriate ON DELETE behaviors
- Indexes are added for frequently queried columns
- Appropriate constraints maintain data integrity
- JSONB fields allow flexible schema evolution (e.g., reactions)
- PostgreSQL NOTIFY/LISTEN is used for real-time updates

## Data Types

- VARCHAR(26): ULID identifiers
- VARCHAR(N): Variable-length character strings
- TEXT: Unlimited length character strings
- BOOLEAN: True/false values
- TIMESTAMPTZ: Date and time with timezone
- JSONB: Binary JSON data
