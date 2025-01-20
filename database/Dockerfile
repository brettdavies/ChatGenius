# If you need a custom PostgreSQL image
FROM postgres:15-alpine

# Add security hardening
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/UTC /etc/localtime && \
    echo "UTC" > /etc/timezone && \
    # Remove unnecessary files
    rm -rf /var/cache/apk/*

# Set secure permissions
RUN chmod 0700 /var/lib/postgresql/data

# Copy initialization scripts
COPY database/init.sql /docker-entrypoint-initdb.d/01_init.sql
COPY server/src/db/seeds/01_sample_data.sql /docker-entrypoint-initdb.d/02_sample_data.sql

# Copy custom PostgreSQL config
COPY database/postgresql.conf /etc/postgresql/postgresql.conf
COPY database/pg_hba.conf /etc/postgresql/pg_hba.conf

# Set non-root user
USER postgres

# Use custom config
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf", "-c", "hba_file=/etc/postgresql/pg_hba.conf"] 