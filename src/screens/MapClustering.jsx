import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

const MapClustering = () => {
  // State to store markers and clusters
  const [points, setPoints] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [region, setRegion] = useState({
    latitude: 33.6678733,
    longitude: 73.0577642,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [loading, setLoading] = useState(true);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);

  // Reference to the map
  const mapRef = useRef(null);

  // Sample data for demonstration (50 random points around the center)
  useEffect(() => {
    // Generate 50 random points around the center
    const randomPoints = Array(50)
      .fill()
      .map((_, index) => {
        const id = `point-${index}`;
        const latitude = region.latitude + (Math.random() - 0.5) * 0.05;
        const longitude = region.longitude + (Math.random() - 0.5) * 0.05;
        const category = ['restaurant', 'hotel', 'shop', 'attraction'][
          Math.floor(Math.random() * 4)
        ];
        const rating = Math.floor(Math.random() * 5) + 1;

        return {
          id,
          coordinate: {latitude, longitude},
          title: `Point ${id}`,
          description: `A ${category} with rating ${rating}`,
          category,
          rating,
        };
      });

    setPoints(randomPoints);
    setLoading(false);
  }, []);

  // Clustering algorithm
  useEffect(() => {
    if (!clusteringEnabled) {
      setClusters([]);
      return;
    }

    const createClusters = () => {
      const clusterDistance = 50; // pixels
      const deviceWidth = Dimensions.get('window').width;
      const deviceHeight = Dimensions.get('window').height;

      // Function to convert lat/lng to pixel coordinates
      const latLngToPixel = (latitude, longitude) => {
        const scale = Math.pow(2, 15); // Zoom level approximation
        const worldCoordinate = project(latitude, longitude);
        const pixelCoordinate = {
          x: Math.floor(worldCoordinate.x * scale),
          y: Math.floor(worldCoordinate.y * scale),
        };
        return pixelCoordinate;
      };

      // Mercator projection
      const project = (latitude, longitude) => {
        const MERCATOR_RANGE = 256;
        const siny = Math.sin((latitude * Math.PI) / 180);
        const sinySigned = siny < 0 ? -1 : 1;
        const sin = Math.min(Math.max(siny, -0.9999), 0.9999);

        return {
          x: MERCATOR_RANGE * (0.5 + longitude / 360),
          y:
            MERCATOR_RANGE *
            (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)),
        };
      };

      // Create clusters
      let newClusters = [];
      let pointsToProcess = [...points];

      while (pointsToProcess.length > 0) {
        const point = pointsToProcess.shift();
        const pointPixel = latLngToPixel(
          point.coordinate.latitude,
          point.coordinate.longitude,
        );

        let clusterFound = false;

        for (let i = 0; i < newClusters.length; i++) {
          const cluster = newClusters[i];
          const clusterPixel = latLngToPixel(
            cluster.coordinate.latitude,
            cluster.coordinate.longitude,
          );

          const distance = Math.sqrt(
            Math.pow(pointPixel.x - clusterPixel.x, 2) +
              Math.pow(pointPixel.y - clusterPixel.y, 2),
          );

          if (distance <= clusterDistance) {
            cluster.points.push(point);
            clusterFound = true;
            break;
          }
        }

        if (!clusterFound) {
          newClusters.push({
            id: `cluster-${newClusters.length}`,
            coordinate: point.coordinate,
            points: [point],
          });
        }
      }

      setClusters(newClusters);
    };

    createClusters();
  }, [points, region, clusteringEnabled]);

  // Handle region change
  const handleRegionChangeComplete = newRegion => {
    setRegion(newRegion);
  };

  // Get user's current location
  const getUserLocation = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
        setLoading(false);
      },
      error => {
        console.error(error);
        setLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  // Toggle clustering
  const toggleClustering = () => {
    setClusteringEnabled(!clusteringEnabled);
  };

  // Render cluster marker
  const renderClusterMarker = cluster => {
    return (
      <Marker
        key={cluster.id}
        coordinate={cluster.coordinate}
        tracksViewChanges={false}
        onPress={() => {
          // Zoom in when a cluster is tapped
          if (cluster.points.length > 1) {
            mapRef.current?.animateToRegion(
              {
                latitude: cluster.coordinate.latitude,
                longitude: cluster.coordinate.longitude,
                latitudeDelta: region.latitudeDelta / 2,
                longitudeDelta: region.longitudeDelta / 2,
              },
              300,
            );
          }
        }}>
        <View
          style={[
            styles.clusterMarker,
            {
              backgroundColor:
                cluster.points.length === 1
                  ? getCategoryColor(cluster.points[0].category)
                  : '#1E88E5',
            },
          ]}>
          <Text style={styles.clusterText}>
            {cluster.points.length > 1 ? cluster.points.length : ''}
          </Text>
        </View>
      </Marker>
    );
  };

  // Get color based on category
  const getCategoryColor = category => {
    switch (category) {
      case 'restaurant':
        return '#F44336';
      case 'hotel':
        return '#4CAF50';
      case 'shop':
        return '#FFC107';
      case 'attraction':
        return '#9C27B0';
      default:
        return '#2196F3';
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}>
        {/* Render clusters or individual points */}
        {clusteringEnabled
          ? clusters.map(cluster => renderClusterMarker(cluster))
          : points.map(point => (
              <Marker
                key={point.id}
                coordinate={point.coordinate}
                title={point.title}
                description={point.description}
                tracksViewChanges={false}>
                <View
                  style={[
                    styles.markerContainer,
                    {backgroundColor: getCategoryColor(point.category)},
                  ]}>
                  <Text style={styles.markerText}>{point.rating}</Text>
                </View>
              </Marker>
            ))}
      </MapView>

      {/* Map controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={getUserLocation}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.controlButtonText}>📍</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            clusteringEnabled && styles.activeControlButton,
          ]}
          onPress={toggleClustering}>
          <Text style={styles.controlButtonText}>
            {clusteringEnabled ? '🔍' : '📌'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Map Legend</Text>
        <View style={styles.legendRow}>
          <View
            style={[styles.legendItem, {backgroundColor: '#F44336'}]}></View>
          <Text style={styles.legendText}>Restaurant</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[styles.legendItem, {backgroundColor: '#4CAF50'}]}></View>
          <Text style={styles.legendText}>Hotel</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[styles.legendItem, {backgroundColor: '#FFC107'}]}></View>
          <Text style={styles.legendText}>Shop</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[styles.legendItem, {backgroundColor: '#9C27B0'}]}></View>
          <Text style={styles.legendText}>Attraction</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[styles.legendItem, {backgroundColor: '#1E88E5'}]}></View>
          <Text style={styles.legendText}>Cluster</Text>
        </View>
      </View>

      {/* Info footer */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {clusteringEnabled ? 'Clustering enabled' : 'Clustering disabled'} •
          Points: {points.length} • Clusters: {clusters.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
  },
  controlButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeControlButton: {
    backgroundColor: '#4CAF50',
  },
  controlButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  clusterMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clusterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  markerContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  markerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  legendContainer: {
    position: 'absolute',
    left: 20,
    bottom: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  legendItem: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  legendText: {
    fontSize: 12,
    color: 'black',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#333333',
  },
});

export default MapClustering;
