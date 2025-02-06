import React, {useEffect} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

const SplashScreen = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icons/logo.png')} style={styles.logo} />
      <Text style={styles.text}>Deliciousness awaits you!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  logo: {
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  text: {
    fontSize: 26,
    color: '#ffffff',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});

export default SplashScreen;
