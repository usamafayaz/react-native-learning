import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TextInput,
  Keyboard,
  FlatList,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';

const LocationPicker = ({onLocationSelect, initialCoordinates}) => {
  // Refs for accessing map methods
  const mapRef = useRef(null);

  // State management
  const [marker, setMarker] = useState(initialCoordinates || null); // Selected location marker
  const [locationDetails, setLocationDetails] = useState(null); // Details of selected location
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls
  const [mapType, setMapType] = useState('standard'); // Map view type (standard/satellite)
  const [searchQuery, setSearchQuery] = useState(''); // User's search text
  const [isSearching, setIsSearching] = useState(false); // Search in progress indicator
  const [suggestions, setSuggestions] = useState([]); // Search suggestions
  const [showSuggestions, setShowSuggestions] = useState(false); // Control suggestions visibility

  // Default map region (fallback to Islamabad if no initial coordinates)
  const defaultRegion = {
    latitude: initialCoordinates?.latitude || 33.6678733,
    longitude: initialCoordinates?.longitude || 73.0577642,
    latitudeDelta: 0.01, // Zoom level (smaller = more zoomed in)
    longitudeDelta: 0.01,
  };

  // Fetch location suggestions as user types
  useEffect(() => {
    // Debounce function to avoid too many API calls
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Reusable function for Nominatim API requests
  const fetchNominatimData = async (query, limit) => {
    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${limit}`,
      {
        headers: {
          'User-Agent': 'LocationPickerApp/1.0',
        },
      },
    );
    return response.json();
  };

  // Fetch location suggestions from Nominatim API
  const fetchSuggestions = async () => {
    try {
      const data = await fetchNominatimData(searchQuery, 8);
      // Format suggestions for display
      const formattedSuggestions = data.map(item => ({
        id: item.place_id,
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));
      setSuggestions(formattedSuggestions);
      setShowSuggestions(formattedSuggestions.length > 0);
    } catch (error) {
      console.error('Suggestion fetch error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle selection of a suggestion
  const handleSuggestionSelect = suggestion => {
    // Set search query to selected location name
    setSearchQuery(suggestion.name.split(',')[0]);

    // Hide suggestions
    setShowSuggestions(false);

    // Create location object
    const newLocation = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    };

    // Update marker position
    setMarker(newLocation);

    // Animate map to new location
    mapRef.current?.animateToRegion(
      {
        ...newLocation,
        latitudeDelta: 0.009,
        longitudeDelta: 0.009,
      },
      1000,
    );

    // Get detailed information for this location
    getLocationDetails(newLocation.latitude, newLocation.longitude);
  };

  // Search for location using OpenStreetMap Nominatim API (free)
  const handleSearch = async () => {
    // Validate input
    if (!searchQuery.trim()) return;

    // Close keyboard and show loading state
    Keyboard.dismiss();
    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const data = await fetchNominatimData(searchQuery, 1);
      if (data && data.length > 0) {
        // Extract location data from response
        const {lat, lon} = data[0];
        const newLocation = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        };

        // Update marker position
        setMarker(newLocation);

        // Animate map to new location
        mapRef.current?.animateToRegion(
          {
            ...newLocation,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          },
          1000,
        );

        // Get detailed information for this location
        getLocationDetails(newLocation.latitude, newLocation.longitude);
      } else {
        Alert.alert('Not Found', 'No location found for your search query');
      }
    } catch (error) {
      console.error('Search Error:', error);
      Alert.alert('Error', 'Failed to search for the location');
    } finally {
      setIsSearching(false);
    }
  };

  // Get detailed location information using reverse geocoding
  const getLocationDetails = async (latitude, longitude) => {
    setIsLoading(true);
    try {
      // Making reverse geocoding request (coords to address)
      // User-Agent header added to comply with Nominatim usage policy
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'LocationPickerApp/1.0',
          },
        },
      );
      const data = await response.json();

      if (data && data.display_name) {
        // Format location data into a structured object
        const details = {
          fullAddress: data.display_name,
          street: data.address.road || data.address.pedestrian || '',
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            '',
          state: data.address.state || '',
          country: data.address.country || '',
          postcode: data.address.postcode || '',
          coordinates: {latitude, longitude},
        };

        // Update local state
        setLocationDetails(details);

        // Send data to parent component if callback exists
        onLocationSelect?.(details);
      } else {
        setLocationDetails({fullAddress: 'Location details not found'});
        Alert.alert(
          'Notice',
          'Could not retrieve detailed address information',
        );
      }
    } catch (error) {
      console.error('Reverse Geocoding Error:', error);
      Alert.alert('Error', 'Failed to get location information');
      setLocationDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle map tap event
  const handleMapPress = useCallback(event => {
    // Hide suggestions when map is tapped
    setShowSuggestions(false);

    // Extract coordinates from the tap event
    const {latitude, longitude} = event.nativeEvent.coordinate;

    // Update marker position
    setMarker({latitude, longitude});

    // Clear existing location details
    setLocationDetails(null);

    // Get location details with a slight delay to prevent API spam
    const timeoutId = setTimeout(() => {
      getLocationDetails(latitude, longitude);
    }, 500);

    // Return cleanup function to prevent memory leaks
    return () => clearTimeout(timeoutId);
  }, []);

  // Recenter map on current marker or default location
  const handleRecenter = () => {
    mapRef.current?.animateToRegion(
      marker
        ? {
            ...marker,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        : defaultRegion,
      300,
    );
  };

  // Switch between standard and satellite map views
  const toggleMapType = () => {
    setMapType(current => (current === 'standard' ? 'satellite' : 'standard'));
  };

  // Finalize location selection
  const confirmLocation = () => {
    if (!marker) {
      Alert.alert('Error', 'Please select a location on the map first');
      return;
    }

    if (locationDetails) {
      onLocationSelect?.(locationDetails);
      Alert.alert('Success', 'Location has been selected');
    }
  };

  // Clear search input
  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle text input focus
  const handleInputFocus = () => {
    if (searchQuery.trim().length >= 3 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Render individual suggestion item
  const renderSuggestionItem = ({item}) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}>
      <Text style={styles.suggestionText} numberOfLines={1}>
        {item.name.split(',')[0]}
      </Text>
      <Text style={styles.suggestionSubText} numberOfLines={1}>
        {item.name.split(',').slice(1).join(',').trim()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Map section with search bar and controls */}
      <View style={styles.mapContainer}>
        {/* Search bar with clear and search buttons */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search location..."
            placeholderTextColor={'grey'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            onFocus={handleInputFocus}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.searchButton, isSearching && styles.searchingButton]}
            onPress={handleSearch}
            disabled={isSearching}>
            {isSearching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.searchButtonText}>🔍</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={item => item.id.toString()}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}

        {/* Map component with marker */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={defaultRegion}
          mapType={mapType}
          onPress={handleMapPress}>
          {marker && <Marker coordinate={marker} />}
        </MapView>

        {/* Map control buttons (recenter and toggle map type) */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapButton} onPress={handleRecenter}>
            <Text style={styles.buttonText}>🎯</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mapButton} onPress={toggleMapType}>
            <Text style={styles.buttonText}>
              {mapType === 'standard' ? '🛰️' : '🗺️'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location details panel */}
      <View style={styles.detailsContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Location Details</Text>
        </View>

        {/* Scrollable details section */}
        <ScrollView style={styles.detailsScrollView}>
          {isLoading ? (
            // Loading indicator
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066CC" />
              <Text style={styles.loadingText}>
                Fetching location details...
              </Text>
            </View>
          ) : !marker ? (
            // Instructions when no location is selected
            <Text style={styles.instructionText}>
              Search for a location or tap anywhere on the map to select
            </Text>
          ) : locationDetails ? (
            // Display location details when available
            <View style={styles.addressContainer}>
              <View style={styles.addressRow}>
                <Text style={styles.addressLabel}>Address:</Text>
                <Text style={styles.addressValue}>
                  {locationDetails.fullAddress}
                </Text>
              </View>

              {/* Conditionally render each address component if available */}
              {locationDetails.street ? (
                <View style={styles.addressRow}>
                  <Text style={styles.addressLabel}>Street:</Text>
                  <Text style={styles.addressValue}>
                    {locationDetails.street}
                  </Text>
                </View>
              ) : null}

              {locationDetails.city ? (
                <View style={styles.addressRow}>
                  <Text style={styles.addressLabel}>City:</Text>
                  <Text style={styles.addressValue}>
                    {locationDetails.city}
                  </Text>
                </View>
              ) : null}

              {locationDetails.state ? (
                <View style={styles.addressRow}>
                  <Text style={styles.addressLabel}>State:</Text>
                  <Text style={styles.addressValue}>
                    {locationDetails.state}
                  </Text>
                </View>
              ) : null}

              {locationDetails.country ? (
                <View style={styles.addressRow}>
                  <Text style={styles.addressLabel}>Country:</Text>
                  <Text style={styles.addressValue}>
                    {locationDetails.country}
                  </Text>
                </View>
              ) : null}

              {locationDetails.coordinates ? (
                <View style={styles.addressRow}>
                  <Text style={styles.addressLabel}>Coordinates:</Text>
                  <Text style={styles.addressValue}>
                    {locationDetails.coordinates.latitude.toFixed(6)},{' '}
                    {locationDetails.coordinates.longitude.toFixed(6)}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            // Error message if location details couldn't be loaded
            <Text style={styles.instructionText}>
              Failed to load location details. Please try again.
            </Text>
          )}
        </ScrollView>

        {/* Confirm button - disabled when no valid location is selected */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!marker || !locationDetails) && styles.disabledButton,
          ]}
          onPress={confirmLocation}
          disabled={!marker || !locationDetails}>
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  mapContainer: {
    flex: 1,
    position: 'relative', // For positioning overlaid controls
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Map fills the entire container
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1, // Ensures search bar appears above map
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: 'black',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 40, // Space for clear button
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 56,
    height: 46,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    color: '#888',
  },
  searchButton: {
    height: 46,
    width: 46,
    backgroundColor: '#0066CC',
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchingButton: {
    backgroundColor: '#62A1E6', // Lighter blue when searching
  },
  searchButtonText: {
    fontSize: 18,
    color: 'white',
  },
  mapControls: {
    position: 'absolute',
    top: 66, // Positioned below search bar
    right: 10,
    backgroundColor: 'transparent',
  },
  mapButton: {
    backgroundColor: 'white',
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
  },
  // Suggestions styles
  suggestionsContainer: {
    position: 'absolute',
    top: 60, // Position below search bar
    left: 10,
    right: 66, // Leave space for map buttons
    zIndex: 2, // Above map but below search bar
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 200,
  },
  suggestionsList: {
    borderRadius: 8,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333333',
  },
  suggestionSubText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '40%', // Limit panel height
  },
  headerContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  detailsScrollView: {
    maxHeight: '70%',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
  },
  instructionText: {
    textAlign: 'center',
    color: '#666666',
    paddingVertical: 30,
  },
  addressContainer: {
    paddingVertical: 15,
  },
  addressRow: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  addressLabel: {
    fontWeight: 'bold',
    width: '25%',
    color: '#555555',
  },
  addressValue: {
    flex: 1,
    color: '#333333',
  },
  confirmButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LocationPicker;
