#!/bin/bash

# Wait for any database initialization
sleep 2

# Start the application
exec uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
