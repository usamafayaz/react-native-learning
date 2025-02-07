import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const WheelSpinner = () => {
  // Animated values for more complex animation
  const wheelRotation = useRef(new Animated.Value(0)).current;
  const wheelPosition = useRef(new Animated.Value(0)).current;
  const wobbleAnimation = useRef(new Animated.Value(0)).current;

  // State to track spin status
  const [isSpinning, setIsSpinning] = useState(false);

  // Spin the wheel with more realistic physics
  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // More complex animation sequence
    Animated.sequence([
      // Initial wobble before spin
      Animated.timing(wobbleAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.elastic(3),
      }),

      // Main spin animation
      Animated.parallel([
        // Rotation with variable speed
        Animated.timing(wheelRotation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),

        // More dynamic horizontal movement
        Animated.timing(wheelPosition, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
      ]),
    ]).start(({finished}) => {
      if (finished) {
        // Gradual deceleration and reset
        Animated.sequence([
          Animated.timing(wheelRotation, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(wobbleAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsSpinning(false);
          wheelPosition.setValue(0);
        });
      }
    });
  };

  // Advanced interpolations
  const rotation = wheelRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1080deg'], // 3 full rotations
  });

  const translateX = wheelPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH - 300],
  });

  const wobble = wobbleAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '15deg', '0deg'],
  });

  // Render detailed spokes
  const renderSpokes = () => {
    const spokeCount = 8;
    return Array.from({length: spokeCount}).map((_, index) => {
      const rotation = `${index * (360 / spokeCount)}deg`;
      return (
        <View
          key={index}
          style={[
            styles.spoke,
            styles.spokeOuter,
            {
              transform: [{rotate: rotation}, {perspective: 1000}],
            },
          ]}>
          <View style={styles.spokeInner} />
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wheel Spinner</Text>

      {/* Animated Wheel Container */}
      <Animated.View
        style={[
          styles.wheelContainer,
          {
            transform: [
              {rotate: wobble}, // Wobble effect
              {rotate: rotation}, // Main rotation
              {translateX: translateX}, // Horizontal movement
            ],
          },
        ]}>
        {/* Outer Rim with Advanced Detailing */}
        <View style={styles.outerRim}>
          <View style={styles.rimHighlight} />
          <View style={styles.tireTreads} />
        </View>

        {/* Wheel Disk with Advanced Spokes */}
        <View style={styles.wheelDisk}>
          {renderSpokes()}

          {/* Enhanced Center Hub */}
          <View style={styles.centerHub}>
            <View style={styles.centerHubDetail} />
          </View>
        </View>

        {/* Rim Bolts */}
        {renderRimBolts()}
      </Animated.View>

      {/* Spin Button */}
      <TouchableOpacity
        style={styles.spinButton}
        onPress={spinWheel}
        disabled={isSpinning}>
        <Text style={styles.buttonText}>
          {isSpinning ? 'Spinning...' : 'Launch Wheel'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Render rim bolts
const renderRimBolts = () => {
  return Array.from({length: 6}).map((_, index) => {
    const angle = index * 60;
    return (
      <View
        key={index}
        style={[
          styles.rimBolt,
          {
            transform: [{rotate: `${angle}deg`}, {translateX: 100}],
          },
        ]}
      />
    );
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    letterSpacing: 1,
  },
  wheelContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRim: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 20,
    borderColor: '#2c2c2c',
    borderRadius: 150,
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  rimHighlight: {
    position: 'absolute',
    width: '105%',
    height: '105%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 160,
    left: '-2.5%',
    top: '-2.5%',
  },
  tireTreads: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 150,
    borderStyle: 'dashed',
  },
  wheelDisk: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  spoke: {
    position: 'absolute',
    width: 8,
    height: 90,
    alignItems: 'center',
    top: '50%',
    marginTop: -45,
    left: '50%',
    marginLeft: -4,
  },
  spokeOuter: {
    backgroundColor: 'transparent',
  },
  spokeInner: {
    width: 4,
    height: '100%',
    backgroundColor: '#555',
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  centerHub: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#222',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  centerHubDetail: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#444',
  },
  rimBolt: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#silver',
    top: '50%',
    marginTop: -5,
  },
  spinButton: {
    marginTop: 30,
    backgroundColor: '#4a4a4a',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default WheelSpinner;
