# Development Guide

This guide covers how to set up and run the Habit Tracker app in development mode.

## Prerequisites

- Docker installed on your machine
- Node.js (v16 or later) if running locally
- A phone with Expo Go app installed
- WiFi network connection (phone and computer must be on same network)

## Option 1: Docker Development Setup

### 1. Build the Docker Image
```bash
docker build -t habit-tracker-dev .
```

### 2. Run the Development Container
```bash
# Run with port mapping and volume mounting for live reload
docker run -p 8081:8081 -v $(pwd):/app -v /app/node_modules habit-tracker-dev
```

### 3. Set Up Convex Backend
In a separate terminal:
```bash
# Install Convex CLI if not already installed
npm install -g convex

# Initialize and start Convex development server
npx convex dev
```

### 4. Connect Your Phone
1. Open Expo Go on your phone
2. Scan the QR code from the Docker container logs
3. Wait for the app to load on your phone

## Option 2: Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Convex
```bash
npx convex dev
```

### 3. Start Development Server
```bash
npm start
```

### 4. Run on Device
- **Phone**: Scan QR code with Expo Go
- **iOS Simulator**: `npm run ios`
- **Android Emulator**: `npm run android`
- **Web**: `npm run web`

## Development Workflow

### Making Changes
1. Edit files in your preferred code editor
2. Changes will automatically reload on your phone (with Docker volume mounting or local setup)
3. Check the terminal for any errors

### Database Changes
1. Modify schema in `convex/schema.ts`
2. Update queries/mutations in `convex/` directory
3. Convex will automatically redeploy changes

### Debugging
- Use React Developer Tools in browser (web version)
- Check Expo Go for runtime errors
- Monitor terminal for build errors
- Use `console.log()` for debugging (visible in terminal)

### Hot Reloading
- **Docker**: Ensure volume mounting is set up correctly
- **Local**: Works out of the box with Expo
- Shake device or press `r` in terminal to manually reload

## Common Issues

### QR Code Not Working
- Ensure phone and computer are on same WiFi network
- Try entering the URL manually in Expo Go
- Check firewall settings

### Docker Volume Issues
- Make sure the volume mount syntax is correct for your OS:
  - **Linux/macOS**: `-v $(pwd):/app`
  - **Windows (PowerShell)**: `-v ${PWD}:/app`
  - **Windows (Command Prompt)**: `-v %cd%:/app`

### Convex Connection Issues
- Check that `npx convex dev` is running
- Verify your Convex configuration
- Ensure you're logged into Convex CLI

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run dev` - Start Convex development server
- `npm run lint` - Run ESLint

## Project Structure

```
habit-tracker/
├── app/                    # Expo Router pages
├── components/            # Reusable UI components
├── convex/               # Backend (database, API)
├── docs/                 # Documentation
└── assets/               # Images, fonts, etc.
```

## Next Steps

After development is working:
1. Review the [deployment guide](./deployment.md) for production setup
2. Check the main [README.md](../README.md) for project overview
3. Explore the codebase starting with `app/index.tsx`