# Shopping List App - React Native

A mobile shopping list application built with React Native, Expo, and TypeScript. This app helps users organize their shopping lists effortlessly with features like category management, priority tracking, and purchase history.

## 📱 Features

- **User Authentication**: Sign up and sign in with email/password
- **Dashboard**: Overview of shopping items with statistics
- **Categories**: Organize items by categories (Fruits, Vegetables, Meat, etc.)
- **Priority Levels**: Mark items as low, medium, or high priority
- **Shopping History**: Track purchased items and spending
- **Profile Management**: Update profile information and avatar
- **Offline Support**: Data persisted locally using AsyncStorage

## 🛠️ Tech Stack

- **React Native** with **Expo** (~54.0)
- **TypeScript** for type safety
- **Expo Router** for navigation
- **AsyncStorage** for local data persistence
- **Expo Linear Gradient** for UI effects
- **Ionicons** for icons

## 📦 Installation

1. **Clone the repository** (if not already done)

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

## 📁 Project Structure

```
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Auth screen (entry point)
│   └── (tabs)/             # Tab navigation
│       ├── _layout.tsx     # Tabs layout
│       ├── dashboard.tsx   # Dashboard tab
│       ├── history.tsx     # History tab
│       └── profile.tsx     # Profile tab
├── assets/
│   └── images/             # App images and icons
├── src/
│   ├── components/         # Reusable components
│   │   ├── AddItemModal.tsx
│   │   └── ShoppingItemCard.tsx
│   ├── constants/          # App constants and theme
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom hooks
│   │   └── useShoppingList.ts
│   ├── screens/            # Screen components
│   │   ├── AuthScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/           # Services
│   │   └── storageService.ts
│   └── types/              # TypeScript types
│       └── index.ts
├── app.json                # Expo configuration
├── package.json
└── tsconfig.json
```

## 🎨 Screenshots

The app features:
- **Auth Screen**: Login/Register with form validation
- **Dashboard**: Categories, stats cards, progress bar, and shopping list
- **History**: Filterable purchase history with daily grouping
- **Profile**: Avatar selection and profile editing

## 🚀 Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web browser
npm run lint       # Run ESLint
```

## 📝 Notes

- This app uses local storage (AsyncStorage) for data persistence
- No backend server required - all data is stored locally on device
- The app was converted from a React web application to React Native

## 🔧 Configuration

The app icon, splash screen, and favicon have been configured to use `assets/images/Enhance a black silh.png`.

## 📄 License

This project is for educational purposes as part of CodeTribe Assessment.