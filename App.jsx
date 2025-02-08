import React from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider, useSelector} from 'react-redux';
import HomeScreen from './src/screens/HomeScreen';
import CartScreen from './src/screens/CartScreen';
import SplashScreen from './src/screens/SplashScreen';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import store from './src/redux/store';
import BallAnimation from './src/screens/BallAnimation';
import Todo from './src/screens/Todo';
import WheelSpinner from './src/screens/WheelSpinnerAnimation';
import AxiosExample from './src/screens/AxiosExample';
import ReactQuery from './src/screens/ReactQueryExample';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {StripeProvider} from '@stripe/stripe-react-native';
import StripePayment from './src/screens/StripePayment';

const Stack = createStackNavigator();

const App = () => {
  const queryClient = new QueryClient();
  return (
    <StripeProvider publishableKey="yourPublishKey">
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <StatusBar barStyle="light-content" backgroundColor="#1c1c1e" />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="StripePayment"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#1c1c1e',
                  shadowColor: 'transparent',
                },
                headerTintColor: '#ffffff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                },
                headerBackTitleVisible: false,
              }}>
              <Stack.Screen
                name="Splash"
                component={SplashScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="BallAnimation"
                component={BallAnimation}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Todo"
                component={Todo}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="WheelSpinner"
                component={WheelSpinner}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AxiosExample"
                component={AxiosExample}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="ReactQuery"
                component={ReactQuery}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="StripePayment"
                component={StripePayment}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={({navigation}) => ({
                  headerTitle: 'Order Your Favourite Food',
                  headerRight: () => <CartIcon navigation={navigation} />,
                })}
              />
              <Stack.Screen name="Cart" component={CartScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </Provider>
      </QueryClientProvider>
    </StripeProvider>
  );
};

// Cart Icon Component (For Cart Button in Header)
const CartIcon = ({navigation}) => {
  const cartItems = useSelector(state => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Cart')}
      style={[styles.cartIconContainer, {top: insets.top + 10}]}>
      <Image
        source={require('./src/assets/icons/cart.png')}
        style={styles.cartIcon}
      />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cartIconContainer: {
    marginRight: 15,
    position: 'absolute',
    right: 10,
    width: 30,
    height: 30,
  },
  cartIcon: {
    width: '100%',
    height: '100%',
    tintColor: '#ffffff',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});

export default App;
