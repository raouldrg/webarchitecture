#!/bin/bash

# ECO Impact Tracker - Backend Startup (Quiet Mode)
# Starts Spring Boot with minimal terminal output

# Set Java 17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# Navigate to backend directory
cd "$(dirname "$0")/.." || exit 1

# Check PostgreSQL silently
if ! brew services list 2>/dev/null | grep -q "postgresql@15.*started"; then
    brew services start postgresql@15 >/dev/null 2>&1
    sleep 2
fi

# Start Spring Boot in quiet mode
# -q silences Maven, Spring banner disabled in application.yml
exec mvn -q spring-boot:run
