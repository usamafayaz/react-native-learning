import React from 'react';
import {View, FlatList, Text, StyleSheet, SafeAreaView} from 'react-native';
import {useSelector} from 'react-redux';
import CartItem from '../components/CartItem';

const CartScreen = () => {
  const cartItems = useSelector(state => state.cart.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.totalItems}>Total Items: {totalItems}</Text>
        {cartItems.length > 0 ? (
          <FlatList
            data={cartItems}
            renderItem={({item}) => <CartItem item={item} />}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.emptyText}>Your cart is empty</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  totalItems: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    flexGrow: 1,
  },
  emptyText: {
    color: '#8e8e93',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CartScreen;
