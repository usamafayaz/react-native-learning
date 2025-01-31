import React from 'react';
import {
  Button,
  FlatList,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {fetchTodos} from '../redux/todoSlice';

const Todo = () => {
  const dispatch = useDispatch();
  const {isLoading, data, error} = useSelector(state => state.todo);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Redux Thunk</Text>

      {isLoading && (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      )}
      {error && (
        <Text style={styles.errorText}>Something went wrong! {error} 😢</Text>
      )}

      {Array.isArray(data) && data.length > 0 && (
        <FlatList
          data={data}
          initialNumToRender={10}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <View style={styles.card}>
              <Text style={styles.todoText}>{`✅  ${item.title}`}</Text>
            </View>
          )}
        />
      )}

      <Button
        title="Fetch Todos"
        onPress={() => dispatch(fetchTodos())}
        color="#007bff"
      />
    </View>
  );
};

export default Todo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    color: '#000',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 8,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',

    elevation: 3,
  },
  todoText: {
    color: '#333',
    fontSize: 16,
  },
});
