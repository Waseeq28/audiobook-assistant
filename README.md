### Expo App Template

React Native template with Expo, Supabase, NativeWind, and Shadcn/UI components.

## Features

- Expo (SDK 54) configured for Expo Go
- Instructions included for EAS Development Build
- Expo Router for file-based routing
- Supabase for backend services
- NativeWind for Tailwind CSS styling
- Shadcn/UI components for React Native (Reusables)
- TypeScript for type safety
- ESLint and Prettier configured

## Prerequisites

- Node.js (v18+)
- npm/yarn/pnpm
- Expo Go app on your phone

## Quick Start

1. Clone and install:

```bash
git clone <repo-url> {{PROJECT_NAME}}
cd {{PROJECT_NAME}}
npm install
```

2. Setup project:

```bash
npm run setup
# Enter your app name (kebab-case) and owner name
```

3. Configure environment:

```bash
# Edit .env with your Supabase credentials
# Get them from: https://app.supabase.com/project/_/settings/api
# Quick copy example env file:
npm run env:copy
```

4. Verify installed dependencies are for the correct Expo version:

```bash
npx expo install --check
npx expo install --fix
npx expo-doctor
```

5. Run the app:

```bash
npx expo start
# Scan QR code with Expo Go app
```

## Project Structure

```
├── app/                 # Expo Router pages
├── components/ui/       # Shadcn/UI components
├── lib/utils.ts         # Utility functions
├── utils/supabase.ts    # Supabase configuration
├── assets/              # Images and assets
└── global.css           # Tailwind styles
```

## Manual Setup

If not using the setup script, replace these placeholders:

- `{{PROJECT_NAME}}` - Project name (kebab-case)
- `{{APP_NAME}}` - Display name
- `{{APP_SLUG}}` - App slug
- `{{APP_SCHEME}}` - URL scheme
- `{{ANDROID_PACKAGE}}` - Android package name

## Creating an EAS Development Build

1. Install EAS CLI: `npm install -g eas-cli`
2. Log in to Expo account: `eas login`
3. Configure the project: `eas build:configure`
4. Add the library: `npx expo install expo-dev-client`
5. Run a build command:
   - android: `eas build --platform android`
   - ios: `eas build --platform ios`
   - all: `eas build --platform all`
6. Install the app on device or emulator with Expo Orbit

## Quick Links

If you run into issues, check these references for more information:

- **[Expo Documentation](https://docs.expo.dev/)** - Complete guide to Expo development, APIs, and best practices
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based routing system for universal React Native apps
- **[EAS Build Setup](https://docs.expo.dev/build/setup/)** - Configure and deploy native builds with Expo Application Services
- **[Expo Login](https://expo.dev/login)** - Sign in to your Expo account for EAS builds and project management
- **[NativeWind Documentation](https://www.nativewind.dev/docs/getting-started/installation)** - Tailwind CSS for React Native styling
- **[React Native Reusables](https://reactnativereusables.com/docs)** - Shadcn/UI components adapted for React Native
- **[Supabase Documentation](https://supabase.com/docs)** - Backend-as-a-Service platform for authentication, database, and real-time features

## License

MIT License
