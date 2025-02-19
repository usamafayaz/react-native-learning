import axios from 'axios';
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

const Signup = ({navigation}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSignup = async () => {
    try {
      const response = await axios.post(
        'http://192.168.X.X:8000/api/user/signup',
        formData,
      );
      ToastAndroid.show(response.data?.msg, ToastAndroid.SHORT);
      navigation.navigate('Login');
    } catch (error) {
      console.log('Signup Error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Create Account</Text>
          <Text style={styles.subHeaderText}>Begin your journey with us</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={formData.name}
            onChangeText={text => setFormData({...formData, name: text})}
            placeholderTextColor={'gray'}
          />
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

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text
              style={[
                styles.subHeaderText,
                {alignSelf: 'flex-end', padding: 20},
              ]}>
              Go to Login
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
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    color: 'black',
  },
  button: {
    backgroundColor: '#4a00e0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
});

export default Signup;
