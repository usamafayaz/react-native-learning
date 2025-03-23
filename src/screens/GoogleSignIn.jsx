import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

GoogleSignin.configure({
  webClientId: 'webClientId.googleusercontent.com',
  offlineAccess: true,
  scopes: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
});

const GoogleLoginScreen = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already signed in
    const checkSignInStatus = async () => {
      try {
        const hasPreviousSignIn = await GoogleSignin.hasPreviousSignIn();
        if (hasPreviousSignIn) {
          // Get current user info
          const currentUser = await GoogleSignin.getCurrentUser();
          setUserInfo(currentUser.user);
        }
      } catch (error) {
        console.error('Sign-in status check error:', error);
      }
    };

    // Subscribe to Firebase auth state changes
    const subscriber = auth().onAuthStateChanged(user => {
      if (user) {
        setUserInfo({
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          id: user.uid,
        });
      }
    });

    checkSignInStatus();

    // Unsubscribe on component unmount
    return subscriber;
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);

      // Check if Play Services are available
      await GoogleSignin.hasPlayServices();

      // Start the sign-in flow
      const response = await GoogleSignin.signIn();
      //   console.log('Full Google Sign-In response:', response);

      // Extract ID token from the response
      // The token is in response.idToken for older versions
      // But in newer versions it's in response.data.idToken
      const idToken =
        response.idToken || (response.data && response.data.idToken);

      if (!idToken) {
        throw new Error('No ID token present in Google Sign-In response');
      }

      // Create Google credential with ID token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase with the Google credential
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      // Extract user info from the response
      const user = response.user || (response.data && response.data.user);
      setUserInfo(user);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Google Sign-In Error:', error);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await auth().signOut();
      setUserInfo(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Google Sign-Out Error:', error);
    }
  };

  // User Profile Screen after login
  const renderProfile = () => {
    return (
      <View style={styles.profileContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>User Profile</Text>
        </View>

        {/* User Information */}
        <View style={styles.userInfoContainer}>
          <Image source={{uri: userInfo.photo}} style={styles.profileImage} />

          <Text style={styles.userName}>{userInfo.name}</Text>
          <Text style={styles.userEmail}>{userInfo.email}</Text>

          <View style={styles.accountInfoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Account ID</Text>
              <Text style={styles.infoValue}>{userInfo.id}</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={signOut}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Login Screen
  const renderLogin = () => {
    return (
      <View style={styles.loginContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />

        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.subtitleText}>Sign in to continue</Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={signIn}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.googleButtonText}>Sign In with Google</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return userInfo ? renderProfile() : renderLogin();
};

const styles = StyleSheet.create({
  // Common styles
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Login screen styles
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 50,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Profile screen styles
  profileContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#323232',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  userInfoContainer: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#4285F4',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 24,
  },
  accountInfoContainer: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  signOutButton: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleLoginScreen;
