import {Button, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';

const fetchProfile = async token => {
  if (!token) throw new Error('No token found');

  const response = await axios.get('http://192.168.X.X:8000/api/user/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const Profile = () => {
  const [token, setToken] = useState('');

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

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile', token],
    queryFn: () => fetchProfile(token),
    enabled: !!token, // Only run query if token exists
    retry: 3, // Retry once if request fails
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {/* Token Display */}
      <Text style={styles.token}>
        Token: {token ? '✅ Loaded' : '❌ Not Found'}
      </Text>

      {/* API Response */}
      {isLoading && <Text style={styles.loading}>Loading...</Text>}
      {error && <Text style={styles.error}>Error: {error.message}</Text>}
      {profile && (
        <View style={styles.profileContainer}>
          <Text style={styles.profileText}>Name: {profile.name}</Text>
          <Text style={styles.profileText}>Email: {profile.email}</Text>
        </View>
      )}

      {/* Fetch Profile Button */}
      <Button title="Fetch Profile" onPress={refetch} color="#007bff" />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  token: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 10,
  },
  loading: {
    color: 'blue',
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  profileContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    elevation: 3,
    marginBottom: 10,
  },
  profileText: {
    fontSize: 16,
    color: '#333',
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
//         'http://192.168.1.8:8000/api/user/profile',
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
