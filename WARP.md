# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Payment Management is a React Native mobile app using Expo for intelligent receipt and payment management. The app is written in Portuguese (Brazilian) and focuses on personal finance control, allowing users to set monthly income, track expenses, and monitor their available balance in real-time.

## Development Commands

### Core Development Commands
- `npm start` - Start Expo development server
- `npm run android` - Start on Android device/emulator  
- `npm run ios` - Start on iOS device/simulator
- `npm run web` - Start on web browser
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Platform-Specific Development
Since this is an Expo project on Windows, use PowerShell commands:
- Check Expo CLI: `expo --version`
- Clear cache: `expo start -c`
- Check device connection: `adb devices` (for Android)

## Architecture & Code Structure

### Main Navigation Architecture
The app uses a bottom tab navigator with three main screens:
- **HomeScreen**: Financial dashboard showing balance, income, and expenses
- **TransactionsScreen**: List and manage financial transactions
- **SettingsScreen**: App configuration and data management

### Data Management Pattern
- **Local Storage**: All data stored locally using AsyncStorage (no backend)
- **Data Keys**: `monthlyIncome`, `totalExpenses`, `transactions`
- **Transaction Structure**: `{id, description, amount, category, type, date}`

### Theme System
Centralized theme configuration in `src/theme.js`:
- Material Design-inspired green color scheme for finance apps
- Consistent spacing system (`xs: 4px` to `xxl: 40px`) 
- Typography definitions for consistent text rendering
- Brazilian Real (BRL) currency formatting throughout

### Screen Architecture Patterns
Each screen follows a consistent pattern:
1. State management with React hooks
2. AsyncStorage integration for persistence
3. Modal-based forms for data input
4. Floating Action Button (FAB) for primary actions
5. Error handling with Alert dialogs
6. Brazilian Portuguese UI text

### Key Technical Patterns
- **Currency Display**: Brazilian Real formatting with `Intl.NumberFormat('pt-BR')`
- **Form Validation**: Client-side validation with user-friendly error messages
- **Icon Integration**: Ionicons with category-specific icons for transactions
- **Component Structure**: React Native Paper components for Material Design consistency

## Development Guidelines

### State Management
- Use AsyncStorage directly (no complex state management needed)
- Always update both local state and AsyncStorage together
- Implement proper error handling for storage operations

### UI Patterns
- Follow existing card-based layout patterns
- Use FAB for primary actions on each screen
- Implement modal overlays for forms
- Maintain consistent spacing using the spacing system from theme.js

### Category System
The app uses predefined expense categories:
`Alimentação`, `Transporte`, `Lazer`, `Saúde`, `Educação`, `Casa`, `Roupas`, `Outros`

### Transaction Types
- `expense`: Outgoing transactions (red/error color)
- `income`: Incoming transactions (green/success color)

## Important Context

### Language & Localization
- All UI text is in Brazilian Portuguese
- Currency is Brazilian Real (R$)
- Date formatting uses Brazilian format (dd/mm/yyyy)

### Development Status
This appears to be a work-in-progress app with several placeholder functionalities marked as "Em Desenvolvimento" (In Development). Many features in SettingsScreen show development alerts.

### Data Privacy
The app stores all data locally on device using AsyncStorage - no external APIs or cloud storage integration.