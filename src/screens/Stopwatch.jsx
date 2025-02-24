import React, {useState, useEffect} from 'react';
import {View, Text, Button, Alert, Platform} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import PushNotification from 'react-native-push-notification';

const Stopwatch = () => {
  const [time, setTime] = useState(0); // Time in seconds
  const [isRunning, setIsRunning] = useState(false);
  const NOTIFICATION_ID = 1; // Use a simple number for ID

  // Setup notifications when component mounts
  useEffect(() => {
    setupNotifications();

    return () => {
      if (isRunning) {
        stopTimer();
      }
      // Clean up notifications when component unmounts
      PushNotification.cancelAllLocalNotifications();
    };
  }, []);

  const setupNotifications = () => {
    // Create the notification channel (Android 8.0+)
    PushNotification.createChannel(
      {
        channelId: 'stopwatch-channel',
        channelName: 'Stopwatch Timer',
        channelDescription: 'Shows the current stopwatch time',
        playSound: false,
        soundName: 'default',
        importance: 4, // High importance
        vibrate: false,
      },
      created => {
        console.log(`Stopwatch channel created: ${created}`);
        // Show confirmation
        if (created) {
          Alert.alert(
            'Notification Channel Created',
            'Stopwatch notifications should now work',
          );
        } else {
          console.log('Channel may already exist');
        }
      },
    );
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);

      // Create initial notification
      showNotification(time);

      BackgroundTimer.runBackgroundTimer(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          showNotification(newTime);
          return newTime;
        });
      }, 1000);

      // Log for debugging
      console.log('Started timer with notification');
    }
  };

  const stopTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      BackgroundTimer.stopBackgroundTimer();

      // Update notification to show paused state
      PushNotification.localNotification({
        id: NOTIFICATION_ID,
        channelId: 'stopwatch-channel',
        title: 'Stopwatch Paused',
        message: `Time: ${formatTime(time)}`,
        ongoing: true,
        playSound: false,
        priority: 'high',
      });

      console.log('Stopped timer');
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTime(0);
    // Cancel the notification
    PushNotification.cancelLocalNotification(NOTIFICATION_ID);
    console.log('Reset timer and removed notification');
  };

  // Function to show notification
  const showNotification = elapsedTime => {
    try {
      PushNotification.localNotification({
        id: NOTIFICATION_ID,
        channelId: 'stopwatch-channel',
        title: 'Stopwatch Running',
        message: `Time: ${formatTime(elapsedTime)}`,
        ongoing: true,
        priority: 'high',
        vibrate: false,
        playSound: false,
        visibility: 'public',
        actions: ['Stop', 'Reset'],
      });
      console.log(`Updated notification with time: ${formatTime(elapsedTime)}`);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  };

  // Debug function
  const testNotification = () => {
    try {
      PushNotification.localNotification({
        channelId: 'stopwatch-channel',
        title: 'Test Notification',
        message: 'This is a test',
        priority: 'high',
      });
      console.log('Sent test notification');
      Alert.alert('Test Notification Sent', 'Check your notification area');
    } catch (error) {
      console.error('Test notification error:', error);
      Alert.alert('Notification Error', error.message);
    }
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text
        style={{
          fontSize: 40,
          fontWeight: 'bold',
          marginBottom: 20,
          color: 'black',
        }}>
        {formatTime(time)}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '80%',
          marginBottom: 20,
        }}>
        {!isRunning ? (
          <Button title="Start" onPress={startTimer} />
        ) : (
          <Button title="Pause" onPress={stopTimer} />
        )}
        <Button title="Reset" onPress={resetTimer} />
      </View>
      <Button
        title="Test Notification"
        onPress={testNotification}
        color="#841584"
      />
    </View>
  );
};

export default Stopwatch;
