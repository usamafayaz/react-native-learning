import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import ApiService from '../data/axiosApi';

const AxiosExample = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getPosts(5);
      setPosts(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      const newPost = {
        title: 'New Post',
        body: 'Post Content',
        userId: 1,
      };
      const createdPost = await ApiService.createPost(newPost);
      setPosts([createdPost, ...posts]);
    } catch (err) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const handleUpdatePost = async () => {
    if (!currentPost) return;

    try {
      const updatedPost = await ApiService.updatePost(currentPost.id, {
        title: currentPost.title,
        body: currentPost.body,
      });

      setPosts(
        posts.map(post => (post.id === updatedPost.id ? updatedPost : post)),
      );
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update post');
    }
  };

  const handleDeletePost = async postId => {
    try {
      await ApiService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderPostItem = ({item}) => (
    <View style={styles.postCard}>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postBody}>{item.body}</Text>
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setCurrentPost(item);
            setModalVisible(true);
          }}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePost(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const UpdateModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Post</Text>
          <TextInput
            style={styles.input}
            value={currentPost?.title}
            onChangeText={text =>
              setCurrentPost(prev => ({...prev, title: text}))
            }
            placeholder="Post Title"
          />
          <TextInput
            style={styles.input}
            value={currentPost?.body}
            onChangeText={text =>
              setCurrentPost(prev => ({...prev, body: text}))
            }
            placeholder="Post Content"
            multiline
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdatePost}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Axios CRUD</Text>

      <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
        <Text style={styles.buttonText}>Create Post</Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderPostItem}
        refreshing={loading}
        onRefresh={fetchPosts}
      />

      <UpdateModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: 'black',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postBody: {
    color: '#666',
    marginBottom: 10,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
});

export default AxiosExample;
