import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  ToastAndroid,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const Signup = ({navigation}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocus, setInputFocus] = useState({
    name: false,
    email: false,
    password: false,
    role: false,
  });

  const handleSignup = async () => {
    try {
      setIsLoading(true);
      if (
        !formData.email ||
        !formData.name ||
        !formData.password ||
        !formData.role
      ) {
        ToastAndroid.show('Please fill all the fieldsss!', ToastAndroid.SHORT);
        return;
      }
      const response = await axios.post(
        'http://IPADDRESS:8000/api/users/signup',
        formData,
      );
      ToastAndroid.show(response.data?.msg, ToastAndroid.SHORT);
      navigation.navigate('Login');
    } catch (error) {
      ToastAndroid.show(
        error.response?.data?.error || 'Signup failed. Please try again.',
        ToastAndroid.LONG,
      );
      console.log('Signup Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <StatusBar backgroundColor="#0F172A" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Create Account</Text>
          <Text style={styles.subHeaderText}>Begin your journey with us</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={[styles.input, inputFocus.name && styles.inputFocused]}
              value={formData.name}
              onChangeText={text => setFormData({...formData, name: text})}
              onFocus={() => setInputFocus({...inputFocus, name: true})}
              onBlur={() => setInputFocus({...inputFocus, name: false})}
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, inputFocus.email && styles.inputFocused]}
              value={formData.email}
              onChangeText={text => setFormData({...formData, email: text})}
              onFocus={() => setInputFocus({...inputFocus, email: true})}
              onBlur={() => setInputFocus({...inputFocus, email: false})}
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[styles.input, inputFocus.password && styles.inputFocused]}
              secureTextEntry
              value={formData.password}
              onChangeText={text => setFormData({...formData, password: text})}
              onFocus={() => setInputFocus({...inputFocus, password: true})}
              onBlur={() => setInputFocus({...inputFocus, password: false})}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Role</Text>
            <TextInput
              style={[styles.input, inputFocus.role && styles.inputFocused]}
              value={formData.role}
              onChangeText={text => setFormData({...formData, role: text})}
              onFocus={() => setInputFocus({...inputFocus, role: true})}
              onBlur={() => setInputFocus({...inputFocus, role: false})}
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.8}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLinkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 30,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 32,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputFocused: {
    borderColor: '#6366F1',
    backgroundColor: '#1E293B',
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#4F46E5',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#94A3B8',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  footerLinkText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default Signup;
