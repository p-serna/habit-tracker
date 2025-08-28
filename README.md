# Habit Point Tracker

A React Native habit tracking app built with Expo and Convex backend that gamifies habit formation through a point-based system.

## Features

- ✅ Track daily habits with customizable targets
- 🎯 Point-based reward system for motivation
- 📊 Weekly progress visualization
- 🏆 Achievement system
- 🎨 Customizable habit icons and colors
- 📱 Cross-platform support (iOS, Android, Web)

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Convex (real-time database)
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet
- **State Management**: Convex real-time subscriptions

## Prerequisites

Before running this app, make sure you have:

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- A Convex account (sign up at [convex.dev](https://convex.dev))

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd habit-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Create a new Convex project (if needed)
   - Deploy your database schema
   - Start the Convex development server

4. **Start the development server**
   ```bash
   npm start
   ```

## Running the App

### Development

- **All platforms**: `npm start` - Opens Expo DevTools
- **iOS**: `npm run ios` - Opens in iOS Simulator
- **Android**: `npm run android` - Opens in Android Emulator
- **Web**: `npm run web` - Opens in web browser

### Convex Backend

- **Start Convex dev server**: `npm run dev`
- **Deploy to production**: `npx convex deploy`

## Project Structure

```
habit-tracker/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   ├── add-habit.tsx      # Add new habit screen
│   └── achievements.tsx   # Achievements screen
├── components/            # Reusable UI components
│   ├── HabitCard.tsx     # Individual habit display
│   ├── StatsHeader.tsx   # Statistics header
│   └── WeeklyProgress.tsx # Weekly progress chart
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── habits.ts         # Habit-related queries/mutations
│   ├── completions.ts    # Completion tracking
│   ├── achievements.ts   # Achievement system
│   └── stats.ts          # Statistics queries
└── assets/               # Images, fonts, etc.
```

## Database Schema

The app uses Convex with the following main tables:

- **habits**: Store habit definitions (name, color, icon, points, target frequency)
- **habitCompletions**: Track daily completions
- **achievements**: User achievements and milestones

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run dev` - Start Convex development server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.