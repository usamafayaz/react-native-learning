import React, {useRef} from 'react';
import {Animated, Text, TouchableWithoutFeedback, View} from 'react-native';

const BallAnimation = () => {
  // Animated position values
  const ballPosition = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const handleTouch = event => {
    const {locationX, locationY} = event.nativeEvent;

    // Spring Animation Explanation
    Animated.spring(ballPosition, {
      // toValue accepts an object with x and y when using ValueXY
      toValue: {
        x: locationX - 50, // Center the ball horizontally
        y: locationY - 50, // Center the ball vertically
      },

      // FRICTION: Controls the "dampening" of the spring
      // Lower value (0-1): More bouncy, more oscillations
      // Higher value (>10): Less bouncy, quicker stop
      friction: 7, // Moderate bounciness

      // TENSION: Controls the "stiffness" of the spring
      // Lower value: Slower, more gentle movement
      // Higher value: Faster, more aggressive movement
      tension: 40, // Moderate spring stiffness

      // Required for 2D animations
      useNativeDriver: false,
    }).start();
  };

  return (
    <TouchableWithoutFeedback onPress={handleTouch}>
      <View
        style={{
          backgroundColor: '#26262e',
          flex: 1,
        }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 40,
            color: 'white',
            textAlign: 'center',
            paddingTop: 50,
          }}>
          Touch to Move Ball
        </Text>

        <Animated.View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'red',
            position: 'absolute',
            transform: [
              {translateX: ballPosition.x},
              {translateY: ballPosition.y},
            ],
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default BallAnimation;

// import React, {useRef} from 'react';
// import {
//   Animated,
//   Text,
//   TouchableWithoutFeedback,
//   View,
//   Dimensions,
// } from 'react-native';

// const BallAnimation = () => {
//   // Animated position values
//   const posX = useRef(new Animated.Value(0)).current;
//   const posY = useRef(new Animated.Value(0)).current;

//   // Handle touch event
//   const handleTouch = event => {
//     // Get touch coordinates
//     const {locationX, locationY} = event.nativeEvent;

//     // Adjust for ball's own size (100x100)
//     const adjustedX = locationX - 50;
//     const adjustedY = locationY - 50;

//     // Animate ball to touch location
//     Animated.spring(posX, {
//       toValue: adjustedX,
//       friction: 7,
//       tension: 40,
//       useNativeDriver: false,
//     }).start();

//     Animated.spring(posY, {
//       toValue: adjustedY,
//       friction: 7,
//       tension: 40,
//       useNativeDriver: false,
//     }).start();

//     // Log touch coordinates
//     console.log(
//       `Touched at: X(${locationX.toFixed(2)}, Y(${locationY.toFixed(2)})`,
//     );
//   };

//   return (
//     <TouchableWithoutFeedback onPress={handleTouch}>
//       <View
//         style={{
//           backgroundColor: '#26262e',
//           flex: 1,
//         }}>
//         <Text
//           style={{
//             fontSize: 22,
//             fontWeight: 'bold',
//             marginBottom: 40,
//             color: 'white',
//             textAlign: 'center',
//             paddingTop: 50,
//           }}>
//           Touch to Move Ball
//         </Text>

//         <Animated.View
//           style={{
//             width: 100,
//             height: 100,
//             borderRadius: 50,
//             backgroundColor: 'red',
//             position: 'absolute',
//             transform: [{translateX: posX}, {translateY: posY}],
//           }}
//         />
//       </View>
//     </TouchableWithoutFeedback>
//   );
// };

// export default BallAnimation;
