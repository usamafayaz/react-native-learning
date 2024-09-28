import React from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

const TestComponent = () => {
  const cartItems = useSelector(state => state.cart.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View>
      <Text style={{alignSelf: 'center', fontSize: 20}}>
        Total Items: {totalItems}
      </Text>
    </View>
  );
};

export default TestComponent;
