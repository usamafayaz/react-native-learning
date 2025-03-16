import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

const UserLocationTracker = () => {
  // State to store user's location
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(true);

  // Reference to the map for programmatic control
  const mapRef = useRef(null);

  // Location update interval (in milliseconds)
  const LOCATION_UPDATE_INTERVAL = 10000; // 10 seconds

  // Location watch ID for cleanup
  let watchId = useRef(null);

  // Request location permissions
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const granted = await Geolocation.requestAuthorization('whenInUse');
        return granted === 'granted';
      } else if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to show it on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        setLoading(false);

        // Animate map to user's location
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            1000,
          );
        }
      },
      error => {
        setError('Unable to get location: ' + error.message);
        setLoading(false);
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  // Start tracking location
  const startLocationTracking = () => {
    // Clear any existing watch
    if (watchId.current) {
      Geolocation.clearWatch(watchId.current);
    }

    // Start a new watch
    watchId.current = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });

        // Only animate if tracking is enabled
        if (trackingEnabled && mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            1000,
          );
        }

        setLoading(false);
        setError(null);
      },
      error => {
        setError('Location tracking error: ' + error.message);
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Updates if moved by 10 meters
        interval: LOCATION_UPDATE_INTERVAL,
        fastestInterval: 5000, // 5 seconds
      },
    );
  };

  // Stop tracking location
  const stopLocationTracking = () => {
    if (watchId.current) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  // Toggle tracking
  const toggleTracking = () => {
    setTrackingEnabled(!trackingEnabled);
    if (!trackingEnabled && location) {
      // If re-enabling tracking, move to current location
      mapRef.current?.animateToRegion(location, 1000);
    }
  };

  // Recenter map on user's location
  const recenterMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(location, 1000);
    }
  };

  // Initial setup when component mounts
  useEffect(() => {
    const setup = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        getCurrentLocation();
        startLocationTracking();
      } else {
        setError('Location permission denied');
        setLoading(false);
      }
    };

    setup();

    // Cleanup function to stop tracking when component unmounts
    return () => {
      stopLocationTracking();
    };
  }, []);

  return (
    <View style={styles.container}>
      {loading && !location ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={getCurrentLocation}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={location}>
            {location && (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="You are here"
                description="Your current location">
                <View style={styles.markerContainer}>
                  <View style={styles.markerDot} />
                  <View style={styles.markerHalo} />
                </View>
              </Marker>
            )}
          </MapView>

          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={recenterMap}>
              <Text style={styles.controlButtonText}>📍</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                trackingEnabled ? styles.controlButtonActive : null,
              ]}
              onPress={toggleTracking}>
              <Text style={styles.controlButtonText}>
                {trackingEnabled ? '⏹️' : '⏯️'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {trackingEnabled
                ? 'Live tracking enabled'
                : 'Live tracking paused'}
            </Text>
            {location && (
              <Text style={styles.coordsText}>
                Lat: {location.latitude.toFixed(6)}, Long:{' '}
                {location.longitude.toFixed(6)}
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  );
};

export default UserLocationTracker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
    fontSize: 16,
    color: '#CC0000',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'column',
  },
  controlButton: {
    backgroundColor: 'white',
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  controlButtonActive: {
    backgroundColor: '#0066CC',
  },
  controlButtonText: {
    fontSize: 20,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 4,
  },
  coordsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  markerContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0066CC',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerHalo: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 102, 204, 0.2)',
  },
});
