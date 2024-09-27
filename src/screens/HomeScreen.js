import React from 'react';
import {View, FlatList, StyleSheet, SafeAreaView} from 'react-native';
import FoodItem from '../components/FoodItem';
import foodData from '../data/foodData';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={foodData}
        renderItem={({item}) => <FoodItem item={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  listContainer: {
    padding: 16,
  },
});

export default HomeScreen;
