import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import {removeFromCart} from '../redux/cartSlice';

const CartItem = ({item}) => {
  const dispatch = useDispatch();

  const handleRemoveFromCart = () => {
    dispatch(removeFromCart(item));
  };

  return (
    <View style={styles.container}>
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
        <TouchableOpacity style={styles.button} onPress={handleRemoveFromCart}>
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
      <Image source={{uri: item.image}} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#2c2c2c',
    marginBottom: 10,
    borderRadius: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  quantity: {
    fontSize: 14,
    color: '#b0b0b0',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#DC143C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 7,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default CartItem;
