import React from 'react';
import {View, StyleSheet} from 'react-native';
import MapView, {Marker, Polygon, Polyline} from 'react-native-maps';

const OBSMapScreen = () => {
  // 🔷 Polygon around OBS Technologia
  const polygonCoordinates = [
    {latitude: 33.66795, longitude: 73.05755}, // Top left
    {latitude: 33.66795, longitude: 73.05798}, // Top right
    {latitude: 33.66765, longitude: 73.05798}, // Bottom right
    {latitude: 33.66765, longitude: 73.05755}, // Bottom left
    {latitude: 33.66795, longitude: 73.05755}, // Closing the polygon
  ];

  // 🔹 Polyline representing a route
  const polylineCoordinates = [
    {latitude: 33.6675, longitude: 73.057}, // Start
    {latitude: 33.668, longitude: 73.0573},
    {latitude: 33.6683, longitude: 73.0576},
    {latitude: 33.6681, longitude: 73.058},
    {latitude: 33.6677, longitude: 73.0582},
    {latitude: 33.6675, longitude: 73.057}, // End (loop)
  ];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 33.6678733,
          longitude: 73.0577642,
          latitudeDelta: 0.002, // Zoom level
          longitudeDelta: 0.002,
        }}>
        {/* 📍 Marker for OBS Technologia */}
        <Marker
          coordinate={{latitude: 33.6678733, longitude: 73.0577642}}
          title="OBS Technologia"
          description="Software Company"
        />

        {/* 🔷 Polygon Around OBS */}
        <Polygon
          coordinates={polygonCoordinates}
          fillColor="rgba(0, 255, 0, 0.3)" // Green with transparency
          strokeColor="green"
          strokeWidth={1}
        />

        {/* 🔹 Polyline Route */}
        <Polyline
          coordinates={polylineCoordinates}
          strokeColor="blue" // Route color
          strokeWidth={3}
          lineCap="round"
          lineDashPattern={[4, 4]} // Dashed line
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default OBSMapScreen;
