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

# Copy initialization script
COPY init.sql /docker-entrypoint-initdb.d/

# Set non-root user
USER postgres 