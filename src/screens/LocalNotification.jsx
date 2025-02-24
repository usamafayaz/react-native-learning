import React, {useEffect} from 'react';
import {View, Button} from 'react-native';
import PushNotification from 'react-native-push-notification';
import configureNotifications from '../services/notificationService';

const LocalNotification = () => {
  // Configure notifications on app load
  useEffect(() => {
    configureNotifications();
  }, []);

  // Function to trigger local notification
  const sendNotification = () => {
    PushNotification.localNotification({
      channelId: 'default-channel', // Must match the channelId created
      title: 'Hello User! 🎉',
      message: 'This is a test local notification!',
      playSound: true,
      smallIcon: 'ic_notification', // File name without extension for icon background icon in drawable folder
      soundName: 'default', // Sound file in android/app/src/main/res/raw
      vibrate: true,
      //   bigText: 'Here is the full message that will be displayed when the user expands the notification.',
      // subText: 'Version 2.0 is now available!',
      priority: 'high', // Options: 'max', 'high', 'default', 'low', 'min'
      //   ongoing: true, // Prevents user from swiping away the notification
    });
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="Send Notification" onPress={sendNotification} />
    </View>
  );
};

export default LocalNotification;
