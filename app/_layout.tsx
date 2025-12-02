import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { setPermissionsGranted } from '../src/store/slices/authSlice';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Only configure notifications if NOT in Expo Go or web
if (!isExpoGo && Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function registerForPushNotificationsAsync(): Promise<string> {
  // Skip notifications in Expo Go or web
  if (isExpoGo || Platform.OS === 'web') {
    console.log('Push notifications not available in Expo Go or web');
    return 'denied';
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus;
}

export default function RootLayout() {
  useEffect(() => {
    // Request permissions on first launch
    const requestPermissions = async () => {
      try {
        const status = await registerForPushNotificationsAsync();
        store.dispatch(setPermissionsGranted(status === 'granted'));
      } catch {
        // Handle error silently
      }
    };

    requestPermissions();

    // Only set up notification listeners if not in Expo Go or web
    if (!isExpoGo && Platform.OS !== 'web') {
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
      });

      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
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
