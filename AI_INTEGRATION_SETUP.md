# AI Chat Integration Setup

This document explains how to set up and run the AI chat integration between the frontend and the MCP (Model Context Protocol) system.

## Overview

The integration allows users to chat with an AI assistant through the frontend, with the following flow:
1. User sends message in frontend
2. Frontend calls Node.js server `/chat` endpoint
3. Node.js server spawns Python MCP client with user message and language
4. MCP client processes message through Gemini AI and MCP tools
5. Response is returned back through the chain to the frontend

## Prerequisites

1. **Python Environment**: Ensure Python is installed with required packages
2. **Node.js Server**: Running on port 3001
3. **MCP Server**: Running on port 8000 (for medical emergency tools)
4. **Environment Variables**: Properly configured in `.env` files

## Required Environment Variables

### For MCP Client (`SIH_2025/.env`):
```
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_NAME=gemini-1.5-flash
TEMPERATURE_FOR_GEMINI=0.7
SESSION_ID=your_session_id
DB_URL=your_database_url
MEDICAL_BOT=your_medical_model_name
```

## Setup Instructions

### 1. Start the MCP Server
```bash
cd SIH_2025
python mcp_server_remote.py
```
This should start the MCP server on `http://127.0.0.1:8000/sse`

### 2. Start the Node.js Server
```bash
cd server
npm start
```
This should start the server on `http://localhost:3001`

### 3. Start the Frontend
```bash
cd frontend
npm run dev
```
This should start the frontend (typically on port 5173)

## Testing the Integration

### Method 1: Using the Test Script
```bash
node test_ai_integration.js
```

### Method 2: Manual Testing
1. Open the frontend application
2. Navigate to the AI Chat page
3. Send a message like "Hello, I'm feeling anxious today"
4. Verify you receive an AI response

## File Structure

```
├── server/
│   └── index.js (contains /chat endpoint)
├── frontend/src/components/
│   └── AIChatWindow.jsx (handles user input and displays responses)
├── SIH_2025/
│   ├── mcp_client_remote.py (processes messages via MCP)
│   ├── mcp_server_remote.py (provides MCP tools)
│   └── .env (environment configuration)
└── test_ai_integration.js (test script)
```

## Language Support

The system supports multiple Indian languages. The current implementation defaults to Tamil (`tam_Taml`), but you can modify the language parameter in:

1. **Frontend**: Change the `language` parameter in `AIChatWindow.jsx`
2. **Server**: Modify the default language in the `/chat` endpoint
3. **MCP Client**: Pass the language as a command line argument

### Supported Languages:
- Tamil: `tam_Taml`
- Hindi: `hin_Deva`
- English: `eng_Latn`
- Bengali: `ben_Beng`
- And many more Indian languages

## Troubleshooting

### Common Issues:

1. **MCP Server Not Running**: Ensure `mcp_server_remote.py` is running on port 8000
2. **Python Dependencies**: Install required packages from `requirements.txt`
3. **Environment Variables**: Verify all required environment variables are set
4. **Port Conflicts**: Ensure ports 3001 and 8000 are available
5. **Python Path**: Ensure Python is accessible from the Node.js server

### Debug Steps:

1. Check server logs for errors
2. Verify MCP server is responding: `curl http://127.0.0.1:8000/sse`
3. Test MCP client directly: `python mcp_client_remote.py "test message" tam_Taml`
4. Check frontend console for network errors

## API Endpoints

### POST /chat
- **Body**: `{ message: string, language: string }`
- **Response**: `{ response: string }`
- **Description**: Processes user message through MCP and returns AI response

## Security Considerations

- The current setup is for development. In production:
  - Restrict CORS origins
  - Add authentication/authorization
  - Use HTTPS
  - Validate input parameters
  - Implement rate limiting
