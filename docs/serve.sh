#!/bin/bash

# Quick server startup script for ORBIT documentation

echo "🛸 ORBIT Documentation Server"
echo "=============================="
echo ""

# Check which server is available
if command -v python3 &> /dev/null; then
    echo "Starting Python HTTP server on http://localhost:8000"
    echo "Press Ctrl+C to stop"
    echo ""
    cd "$(dirname "$0")" || exit
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Starting Python HTTP server on http://localhost:8000"
    echo "Press Ctrl+C to stop"
    echo ""
    cd "$(dirname "$0")" || exit
    python -m SimpleHTTPServer 8000
elif command -v node &> /dev/null; then
    echo "Starting Node HTTP server on http://localhost:8000"
    echo "Press Ctrl+C to stop"
    echo ""
    if ! command -v npx &> /dev/null; then
        echo "Error: npx not found. Please install Node.js with npm."
        exit 1
    fi
    cd "$(dirname "$0")" || exit
    npx http-server -p 8000
elif command -v php &> /dev/null; then
    echo "Starting PHP built-in server on http://localhost:8000"
    echo "Press Ctrl+C to stop"
    echo ""
    cd "$(dirname "$0")" || exit
    php -S localhost:8000
else
    echo "Error: No HTTP server found!"
    echo ""
    echo "Please install one of the following:"
    echo "  - Python 3: sudo apt install python3"
    echo "  - Node.js: https://nodejs.org/"
    echo "  - PHP: sudo apt install php"
    echo ""
    echo "Or open index.html directly in your browser:"
    echo "  file://$(pwd)/index.html"
    exit 1
fi
