# 🛒 Shopping List App - React Native

A modern mobile shopping list application built with React Native, Expo, TypeScript, and **Redux Toolkit** for state management. This app helps users organize their shopping lists effortlessly with features like category management, favorites, priority tracking, purchase history, and push notifications.

## 📲 Download APK

**[Download the Android APK](https://expo.dev/accounts/matlhape/projects/shopping-list-app/builds/143e534b-23f4-4ad4-ae88-c4cf74bd861b)**

> Click the link above to download and install the app on your Android device.

## ✨ Features

### Core Features
- **User Authentication**: Sign up and sign in with email/password (Redux-managed state)
- **Dashboard**: Interactive overview with clickable stat cards for filtering
- **Categories**: Organize items by categories (Fruits, Vegetables, Meat, Dairy, Bakery, Beverages, Snacks, Other)
- **Priority Levels**: Mark items as low, medium, or high priority
- **Favorites**: Mark items as favorites for quick access
- **Shopping History**: Track purchased items with detailed action history (added, purchased, edited, deleted)
- **Profile Management**: View orders, favorites, and update profile information

### Advanced Features
- **Redux State Management**: Centralized state with Redux Toolkit and typed hooks
- **Clickable Filters**: Tap on dashboard stats to filter by category, priority, or favorites
- **Action Tracking**: Complete history of all shopping list actions
- **Profile Orders Tab**: View all purchased items organized by date
- **Push Notifications**: Permission-ready for production builds (notifications work in built APK)
- **Cross-Platform Shadows**: Platform-specific shadow styles (iOS, Android, Web)

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.81.5 | Mobile framework |
| **Expo** | ~54.0.25 | Development platform |
| **TypeScript** | ~5.9.2 | Type safety |
| **Redux Toolkit** | ^2.11.0 | State management |
| **React Redux** | ^9.2.0 | React bindings for Redux |
| **Expo Router** | ~6.0.15 | File-based navigation |
| **Expo Notifications** | ^0.32.13 | Push notifications |
| **Expo Linear Gradient** | ~15.0.7 | UI gradient effects |
| **AsyncStorage** | ^2.1.2 | Local data persistence |

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/PLMatlhape/React-Native-Shopping-List-Tsk4.git
   cd React-Native-Shopping-List-Tsk4
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on device/emulator**:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (macOS only)
   - Scan QR code with Expo Go app on your device

## 🏗️ Build Commands

```bash
# Development build (Android)
npx expo run:android

# Production build via EAS
eas build --platform android --profile preview

# Production build (APK)
eas build --platform android --profile production
```

## 📁 Project Structure

```
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout with Redux Provider
│   ├── index.tsx               # Entry point (redirects to tabs)
│   └── (tabs)/                 # Tab navigation
│       ├── _layout.tsx         # Tabs layout configuration
│       ├── dashboard.tsx       # Dashboard tab
│       ├── history.tsx         # History tab
│       └── profile.tsx         # Profile tab
├── assets/
│   └── images/                 # App images and icons
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── AddItemModal.tsx    # Modal for adding/editing items
│   │   └── ShoppingItemCard.tsx# Shopping item card component
│   ├── constants/              # App constants and theme
│   │   └── Colors.ts           # Color definitions
│   ├── hooks/                  # Custom React hooks
│   │   └── useShoppingList.ts  # Shopping list logic hook
│   ├── screens/                # Screen components
│   │   ├── AuthScreen.tsx      # Login/Register screen
│   │   ├── DashboardScreen.tsx # Main dashboard with filters
│   │   ├── HistoryScreen.tsx   # Purchase history screen
│   │   └── ProfileScreen.tsx   # Profile with orders/favorites
│   ├── services/               # API/Storage services
│   │   └── storageService.ts   # AsyncStorage operations
│   ├── store/                  # Redux store configuration
│   │   ├── index.ts            # Store setup and exports
│   │   ├── hooks.ts            # Typed useSelector/useDispatch
│   │   ├── types.ts            # Redux type definitions
│   │   └── slices/             # Redux slices
│   │       ├── authSlice.ts    # Authentication state
│   │       ├── shoppingSlice.ts# Shopping items state
│   │       └── historySlice.ts # History tracking state
│   ├── types/                  # TypeScript type definitions
│   │   ├── index.ts            # Main types export
│   │   └── shopping.ts         # Shopping-related types
│   └── utils/                  # Utility functions
│       └── notifications.ts    # Push notification setup
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build configuration
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript configuration
```

## 🎨 App Screenshots & Features

### 🔐 Authentication Screen
- Login and Register forms with validation
- Redux-managed authentication state
- Green theme (#2E7D32) throughout

### 📊 Dashboard
- **Stats Cards**: Total items, Completed, Pending, Favorites
- **Clickable Filters**: Tap any stat to filter the list
- **Category Pills**: Filter by category (Fruits, Vegetables, etc.)
- **Priority Badges**: Visual priority indicators
- **Add Item FAB**: Floating action button to add new items

### 📜 History Screen
- **Action Types**: Added, Purchased, Edited, Deleted
- **Daily Grouping**: Items grouped by date
- **Search**: Filter history by item name
- **Action Badges**: Color-coded action indicators

### 👤 Profile Screen
- **Tabs**: Orders | Favorites
- **Orders View**: All purchased items with dates
- **Favorites View**: Quick access to favorite items
- **User Stats**: Total items, completed count

## 🔄 Redux State Management

The app uses Redux Toolkit with three slices:

### Auth Slice (`authSlice.ts`)
```typescript
- user: User | null
- isAuthenticated: boolean
- permissionsGranted: boolean
```

### Shopping Slice (`shoppingSlice.ts`)
```typescript
- items: ShoppingItem[]
- loading: boolean
- activeFilter: FilterType
- activeCategory: Category | null
```

### History Slice (`historySlice.ts`)
```typescript
- entries: HistoryEntry[]
- Actions: ADD_ITEM, PURCHASE_ITEM, EDIT_ITEM, DELETE_ITEM
```

## 🚀 Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web browser
npm run lint       # Run ESLint
```

## � Push Notifications

Push notifications are configured for production builds:
- Permissions are requested on first app launch
- Works in built APK/IPA (not in Expo Go due to SDK 54 limitations)
- Dynamic import to avoid Expo Go errors during development

## 📝 Recent Updates

- ✅ Migrated from Context API to **Redux Toolkit**
- ✅ Added **Favorites** functionality
- ✅ Implemented **clickable stat filters** on Dashboard
- ✅ Enhanced **History** with action tracking
- ✅ Added **Profile Orders** tab
- ✅ Removed deprecated `expo-permissions` package
- ✅ Fixed shadow deprecation warnings for web
- ✅ Production-ready push notification setup

## 👨‍💻 Author

**Pule Matlhape**

- GitHub: [@PLMatlhape](https://github.com/PLMatlhape)

## 📄 License

This project is created for educational purposes as part of CodeTribe Assessment.
- The app was converted from a React web application to React Native

## 🔧 Configuration

The app icon, splash screen, and favicon have been configured to use `assets/images/Enhance a black silh.png`.

## 📄 License

This project is for educational purposes as part of CodeTribe Assessment.