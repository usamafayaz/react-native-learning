import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({navigation}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'http://192.168.X.X:8000/api/user/login',
        formData,
      );

      if (response.status == 200) {
        await saveToken(response.data.token); // Save token securely
        ToastAndroid.show(response.data.msg, ToastAndroid.SHORT);
        navigation.navigate('Profile');
      } else {
        ToastAndroid.show(response.error, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log('Login Error:', error);
    }
  };

  const saveToken = async token => {
    try {
      await AsyncStorage.setItem('user_token', token);
    } catch (error) {
      console.log('Error saving token:', error);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Welcome Back</Text>
          <Text style={styles.subHeaderText}>Sign in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={text => setFormData({...formData, email: text})}
            placeholderTextColor={'gray'}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={formData.password}
            onChangeText={text => setFormData({...formData, password: text})}
            placeholderTextColor={'gray'}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text
              style={[
                styles.subHeaderText,
                {alignSelf: 'flex-end', padding: 20},
              ]}>
              Go to Signup
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#16213e', padding: 20},
  scrollContainer: {flexGrow: 1, justifyContent: 'center'},
  headerContainer: {alignItems: 'center', marginBottom: 30},
  headerText: {fontSize: 32, fontWeight: 'bold', color: '#fff'},
  subHeaderText: {fontSize: 16, color: '#999'},
  formContainer: {width: '100%', maxWidth: 400, alignSelf: 'center'},
  input: {
    color: 'black',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#4a00e0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
});

export default Login;
