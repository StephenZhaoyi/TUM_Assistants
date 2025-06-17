# TUM Assistants

Project demo is now complete! Below are the instructions for running and stopping the project.

## Requirements

- Python version: 3.13.2
- Node.js version: 18.0.0 or higher
- npm version: 9.0.0 or higher
- Gemini API key

## Environment Setup

Before running the project, you need to set up your environment variables:

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a `.env` file and add your Gemini API key:

```bash
GOOGLE_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with your actual Gemini API key.

## How to Run the Project

1. First, clone the repository:

```bash
git clone https://github.com/StephenZhaoyi/TUM_Assistants.git
```

2. Navigate to the project directory:

```bash
cd TUM_Assistants
```

3. Run the backend service:

Windows users:

```bash
cd backend
python ./core.py
```

MacOS users:

```bash
cd backend
python3 ./core.py
```

4. Run the frontend project:

First, install dependencies:

```bash
cd frontend
npm install
```

Then start the development server:

```bash
npm run dev
```

## How to Stop the Project

### Stop Backend Service

- Press `Ctrl + C` (Windows/Linux) or `Command + C` (MacOS) in the terminal running the backend service
- If the backend is running in the background, use the following commands to terminate the process:

Windows users:

```bash
taskkill /F /IM python.exe
```

MacOS/Linux users:

```bash
pkill -f core.py
```

### Stop Frontend Service

- Press `Ctrl + C` (Windows/Linux) or `Command + C` (MacOS) in the terminal running the frontend service
- If the frontend is running in the background, use the following commands to terminate the process:

Windows users:

```bash
taskkill /F /IM node.exe
```

MacOS/Linux users:

```bash
pkill -f node
```
