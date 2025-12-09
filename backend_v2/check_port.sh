#!/bin/bash
# Bash script to check if port 5432 is available and set POSTGRES_PORT

if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1 || nc -z localhost 5432 2>/dev/null; then
    echo "Port 5432 is occupied. Using port 5433 instead."
    export POSTGRES_PORT=5433
else
    echo "Port 5432 is available."
    export POSTGRES_PORT=5432
fi

echo "POSTGRES_PORT set to: $POSTGRES_PORT"

