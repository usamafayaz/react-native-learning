import PushNotification from 'react-native-push-notification';

const configureNotifications = () => {
  // Default channel
  PushNotification.createChannel(
    {
      channelId: 'default-channel',
      channelName: 'Learning About Notifications!',
      importance: 4,
      vibrate: true,
    },
    created => console.log(`Default channel created: ${created}`),
  );

  // Stopwatch specific channel
  PushNotification.createChannel(
    {
      channelId: 'stopwatch-channel',
      channelName: 'Stopwatch Notifications',
      importance: 3, // Medium importance
      vibrate: false, // No need to vibrate for a stopwatch
    },
    created => console.log(`Stopwatch channel created: ${created}`),
  );
};

export default configureNotifications;
