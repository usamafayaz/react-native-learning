// src/notifications/FCMService.ts

import messaging from '@react-native-firebase/messaging';
import {Alert, Platform} from 'react-native';

/**
 * Request user permission for notifications
 */
export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('🔐 Authorization status:', authStatus);
    await getFCMToken();
  } else {
    console.log('❌ Notification permission not granted.');
  }
}

/**
 * Get FCM token for the device
 */
export async function getFCMToken() {
  const token = await messaging().getToken();
  if (token) {
    console.log('📲 FCM Token:', token);
    // You can send this token to your backend if needed to send targeted notifications
  } else {
    console.log('❌ Failed to get FCM Token');
  }
}

/**
 * Handle foreground notifications
 */
export function foregroundNotificationListener() {
  messaging().onMessage(async remoteMessage => {
    console.log('📩 Foreground notification:', remoteMessage);

    // OPTIONAL: Show an alert inside the app when a notification arrives
    if (Platform.OS === 'android') {
      Alert.alert(
        remoteMessage.notification?.title ?? 'Notification',
        remoteMessage.notification?.body ?? '',
      );
    }
  });
}

/**
 * Handle background/quit state notifications
 *
 * IMPORTANT: this should be in index.js (or App.tsx before any screen renders)
 */
export function backgroundNotificationHandler() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('📩 Background notification:', remoteMessage);
    // No UI here — OS will automatically show notification if payload has `notification` field
  });
}
