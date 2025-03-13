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
};

export default configureNotifications;
