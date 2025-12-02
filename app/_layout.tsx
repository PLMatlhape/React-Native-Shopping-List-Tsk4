import Constants from 'expo-constants';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { setPermissionsGranted } from '../src/store/slices/authSlice';

// Check if running in Expo Go - notifications don't work there since SDK 53
const isExpoGo = Constants.appOwnership === 'expo';

export default function RootLayout() {
  useEffect(() => {
    // Only initialize notifications in production builds (not Expo Go)
    // This prevents the expo-notifications error in Expo Go
    if (!isExpoGo && Platform.OS !== 'web') {
      // Dynamically import notifications module only when needed
      import('../src/utils/notifications').then(({ registerForPushNotificationsAsync, addNotificationListeners }) => {
        // Request permissions
        registerForPushNotificationsAsync()
          .then((status) => {
            store.dispatch(setPermissionsGranted(status === 'granted'));
          })
          .catch(() => {
            // Handle error silently
          });

        // Set up listeners
        const cleanup = addNotificationListeners(
          (notification) => {
            console.log('Notification received:', notification);
          },
          (response) => {
            console.log('Notification response:', response);
          }
        );

        return cleanup;
      }).catch((error) => {
        console.log('Notifications not available:', error.message);
      });
    } else {
      console.log('Push notifications not available in Expo Go or web - will work in production build');
    }
  }, []);

  return (
    <Provider store={store}>
      <StatusBar style="light" backgroundColor="#2E7D32" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </Provider>
  );
}
