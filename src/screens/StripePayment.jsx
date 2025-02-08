import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useStripe} from '@stripe/stripe-react-native';

// Configuration
const API_URL = 'backendURL'; // Update with your backend URL
const AMOUNT = 4999; // Amount in cents ($10.00)

const StripePayment = () => {
  // Initialize Stripe hooks
  const {initPaymentSheet, presentPaymentSheet} = useStripe();

  // Component state
  const [loading, setLoading] = useState(false);
  const [paymentSheetReady, setPaymentSheetReady] = useState(false);

  // Initialize payment sheet on component mount
  useEffect(() => {
    initializePaymentSheet();
  }, []);

  // Function to fetch payment intent from backend
  const fetchPaymentSheetParams = async () => {
    try {
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: AMOUNT,
          currency: 'usd',
        }),
      });

      const {clientSecret, publishableKey} = await response.json();
      return {clientSecret, publishableKey};
    } catch (error) {
      console.error('Error fetching payment intent:', error);
      throw new Error('Failed to fetch payment details');
    }
  };

  // Initialize the Payment Sheet
  const initializePaymentSheet = async () => {
    setLoading(true);
    try {
      // Fetch payment intent from your backend
      const {clientSecret, publishableKey} = await fetchPaymentSheetParams();

      // Initialize the Payment Sheet
      const {error} = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Your Store Name',
        // Optional customization
        style: 'automatic',
        appearance: {
          colors: {
            primary: '#007AFF',
          },
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setPaymentSheetReady(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle the payment
  const handlePayment = async () => {
    setLoading(true);
    try {
      // Present the Payment Sheet
      const {error} = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error: ${error.code}`, error.message);
      } else {
        Alert.alert('Success', 'Your payment was confirmed!');
        // Handle post-payment logic here (e.g., update order status)
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stripe Payment Demo</Text>
      <Text style={styles.amount}>Amount: ${(AMOUNT / 100).toFixed(2)}</Text>

      <TouchableOpacity
        style={[
          styles.payButton,
          (!paymentSheetReady || loading) && styles.disabledButton,
        ]}
        onPress={handlePayment}
        disabled={!paymentSheetReady || loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Pay Now</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  amount: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
  },
  payButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StripePayment;
