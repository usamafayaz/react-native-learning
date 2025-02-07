import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

// ✅ API Base URL
const API_URL = 'https://jsonplaceholder.typicode.com/users';

// ✅ API Functions to Handle CRUD Operations
const api = {
  // Fetch all users (GET Request)
  fetchUsers: async () => {
    const {data} = await axios.get(API_URL);
    return data; // Returning fetched data
  },

  // Add a new user (POST Request)
  addUser: async newUser => {
    const {data} = await axios.post(API_URL, newUser);
    return data; // Returning newly added user data
  },

  // Update an existing user (PUT Request)
  updateUser: async ({id, ...updateData}) => {
    const {data} = await axios.put(`${API_URL}/${id}`, updateData);
    return data; // Returning updated user data
  },

  // Delete a user (DELETE Request)
  deleteUser: async id => {
    await axios.delete(`${API_URL}/${id}`);
    return id; // Returning deleted user's ID
  },
};

const ReactQueryExample = () => {
  const queryClient = useQueryClient(); // Access React Query's cache management

  // ✅ Fetch users using useQuery (GET Request)
  const {
    data: users,
    isError,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'], // Unique key to identify this query
    queryFn: api.fetchUsers, // API function to fetch users
    staleTime: 5000, // Consider data fresh for 5 seconds
    retry: 2, // Retry failed requests twice
  });

  // ✅ Add user using useMutation (POST Request)
  const addUserMutation = useMutation({
    mutationFn: api.addUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']); // Refresh users list after adding
      Alert.alert('Success', 'User added successfully');
    },
    onError: error => {
      Alert.alert('Error', error.message);
    },
  });

  // ✅ Update user using useMutation (PUT Request)
  const updateUserMutation = useMutation({
    mutationFn: api.updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']); // Refresh users list after updating
      Alert.alert('Success', 'User updated successfully');
    },
  });

  // ✅ Delete user using useMutation (DELETE Request)
  const deleteUserMutation = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']); // Refresh users list after deleting
      Alert.alert('Success', 'User deleted successfully');
    },
  });

  // ✅ Add user button handler
  const handleAddUser = () => {
    addUserMutation.mutate({
      name: 'New User',
      email: 'newuser@example.com',
      phone: '1234567890',
    });
  };

  // ✅ Update user button handler
  const handleUpdateUser = user => {
    updateUserMutation.mutate({
      id: user.id,
      name: `Updated ${user.name}`,
      email: user.email,
    });
  };

  // ✅ Delete user button handler
  const handleDeleteUser = id => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: () => deleteUserMutation.mutate(id)},
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderUser = ({item}) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={() => handleUpdateUser(item)}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDeleteUser(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Management</Text>
      <TouchableOpacity
        style={[styles.button, styles.addButton]}
        onPress={handleAddUser}>
        <Text style={styles.buttonText}>Add New User</Text>
      </TouchableOpacity>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 16,
  },
  updateButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f44336',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
});

export default ReactQueryExample;
