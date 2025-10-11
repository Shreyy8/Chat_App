@echo off
echo Starting MongoDB...

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% == 0 (
    echo Docker found. Starting MongoDB with Docker...
    docker run -d --name mongodb -p 27017:27017 mongo:latest
    echo MongoDB started on port 27017
    echo You can stop it later with: docker stop mongodb
) else (
    echo Docker not found. Please install MongoDB manually:
    echo 1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
    echo 2. Install it and start the MongoDB service
    echo 3. Or install Docker Desktop and run this script again
)

pause




