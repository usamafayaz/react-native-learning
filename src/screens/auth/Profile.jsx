import {
  Button,
  StyleSheet,
  Text,
  View,
  FlatList,
  ToastAndroid,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useQuery, useMutation} from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = 'http://IPADDRESS:8000/api/users';

// Fetch Profile API
const fetchProfile = async token => {
  if (!token) throw new Error('No token found');

  const response = await axios.get(`${BASE_URL}/profile`, {
    headers: {Authorization: `Bearer ${token}`},
  });
  return response.data;
};

// Fetch All Users API
const fetchAllUsers = async token => {
  if (!token) throw new Error('No token found');

  const response = await axios.get(BASE_URL, {
    headers: {Authorization: `Bearer ${token}`},
  });

  return response.data;
};

const Profile = () => {
  const [token, setToken] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('user_token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };
    getToken();
  }, []);

  // Fetch Profile
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile', token],
    queryFn: () => fetchProfile(token),
    enabled: !!token,
    retry: 3,
  });

  // Fetch All Users Mutation
  const {mutate: getAllUsers, isLoading: isFetchingUsers} = useMutation({
    mutationFn: () => fetchAllUsers(token),
    onSuccess: data => {
      setUsers(data);
      ToastAndroid.show('Users loaded successfully', ToastAndroid.SHORT);
    },
    onError: err => {
      ToastAndroid.show(
        err.response?.data?.error || 'Error loading users',
        ToastAndroid.SHORT,
      );
    },
  });

  // Get user initials for avatar
  const getUserInitials = name => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6200ee" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Profile</Text>
        <View style={styles.tokenBadge}>
          <Text style={styles.tokenText}>
            {token ? 'Authenticated' : 'Not Authenticated'}
          </Text>
        </View>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : profile ? (
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getUserInitials(profile.name)}
                </Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={refetch}
              activeOpacity={0.7}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.fetchProfileButton}
            onPress={refetch}
            activeOpacity={0.7}>
            <Text style={styles.fetchProfileButtonText}>Fetch My Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Admin Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>User Management</Text>
          <TouchableOpacity
            style={[
              styles.adminButton,
              isFetchingUsers && styles.disabledButton,
            ]}
            onPress={() => getAllUsers()}
            disabled={isFetchingUsers}
            activeOpacity={0.7}>
            <Text style={styles.adminButtonText}>
              {isFetchingUsers ? 'Loading...' : 'Load All Users'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Users List */}
        {users.length > 0 ? (
          <FlatList
            data={users}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.usersList}
            renderItem={({item, index}) => (
              <View
                style={[
                  styles.userCard,
                  index % 2 === 0 ? styles.evenCard : styles.oddCard,
                ]}>
                <View
                  style={[
                    styles.userAvatar,
                    {backgroundColor: `hsl(${index * 60}, 70%, 60%)`},
                  ]}>
                  <Text style={styles.userAvatarText}>
                    {getUserInitials(item.name)}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <Text style={styles.userEmail}>Role: {item.role}</Text>
                </View>
              </View>
            )}
          />
        ) : isFetchingUsers ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6200ee" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  tokenBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tokenText: {
    color: '#fff',
    fontSize: 12,
  },
  section: {
    margin: 16,
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: '#6200ee',
    fontWeight: '600',
  },
  fetchProfileButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
  },
  fetchProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adminButton: {
    backgroundColor: '#03a9f4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 1,
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#b3e5fc',
  },
  usersList: {
    paddingBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    alignItems: 'center',
  },
  evenCard: {
    backgroundColor: '#fff',
  },
  oddCard: {
    backgroundColor: '#fafafa',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#757575',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#616161',
  },
});

// import {Button, StyleSheet, Text, View} from 'react-native';
// import React, {useEffect, useState} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// const Profile = () => {
//   const [token, setToken] = useState('');
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const getToken = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem('user_token');
//         if (storedToken) {
//           setToken(storedToken);
//         }
//       } catch (error) {
//         console.error('Error fetching token:', error);
//       }
//     };
//     getToken();
//   }, []);

//   const fetchProfile = async () => {
//     if (!token) {
//       setError('No token found');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     try {
//       const response = await axios.get(
//         'http://IPADDRESS:8000/api/users/profile',
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       setProfile(response.data);
//     } catch (err) {
//       setError('Failed to fetch profile');
//       console.error('API Error:', err);
//     }
//     setLoading(false);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Profile</Text>

//       {/* Token Display */}
//       <Text style={styles.token}>
//         Token: {token ? '✅ Loaded' : '❌ Not Found'}
//       </Text>

//       {/* API Response */}
//       {loading && <Text style={styles.loading}>Loading...</Text>}
//       {error && <Text style={styles.error}>{error}</Text>}
//       {profile && (
//         <View style={styles.profileContainer}>
//           <Text style={styles.profileText}>Name: {profile.name}</Text>
//           <Text style={styles.profileText}>Email: {profile.email}</Text>
//         </View>
//       )}

//       {/* Fetch Profile Button */}
//       <Button title="Fetch Profile" onPress={fetchProfile} color="#007bff" />
//     </View>
//   );
// };

// export default Profile;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f8f9fa',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 20,
//   },
//   token: {
//     fontSize: 14,
//     color: '#007bff',
//     marginBottom: 10,
//   },
//   loading: {
//     color: 'blue',
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   error: {
//     color: 'red',
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   profileContainer: {
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     shadowColor: '#000',
//     elevation: 3,
//     marginBottom: 10,
//   },
//   profileText: {
//     fontSize: 16,
//     color: '#333',
//   },
// });
