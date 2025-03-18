import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity, Animated, Dimensions, PanResponder } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";

export function Location() {
  const [markers] = useState([
    {
      id: 1,
      title: "PokeCenter",
      coordinate: { latitude: 36.87424, longitude: 30.65714 },
      address: "Konyaaltı, Antalya, Turkey",
      image:
        "https://www.dexerto.com/cdn-image/wp-content/uploads/2022/09/04/pokemon-center-header.jpg?width=1200&quality=60&format=auto",
    },
    {
      id: 2,
      title: "PokeCenter",
      coordinate: { latitude: 36.87907, longitude: 30.71859 },
      address: "Beşiktaş, İstanbul, Turkey",
      image:
        "https://www.dexerto.com/cdn-image/wp-content/uploads/2022/09/04/pokemon-center-header.jpg?width=1200&quality=60&format=auto",
    },
  ]);

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [translateY] = useState(new Animated.Value(-500)); // Card position for animation (start from above)
  const [dragging, setDragging] = useState(false);
  const [cardHeight, setCardHeight] = useState(0); // To calculate the height of the card

  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    // Set card height after render to calculate correct position
    if (cardHeight === 0 && selectedMarker) {
      setCardHeight(screenHeight * 0.4); // Set to 40% of screen height (you can adjust as needed)
    }
  }, [selectedMarker, cardHeight]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      if (gestureState.dy > 0) {
        // Allow drag down (to close the card)
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (gestureState.dy > 150) {
        // Close the card if dragged more than 150px down
        closeCard();
      } else {
        // Otherwise, animate it back to the center
        Animated.spring(translateY, {
          toValue: 0, // Set to 0 to open the card from the center
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    Animated.timing(translateY, {
      toValue: screenHeight / 2 - cardHeight / 2, // Center the card on the screen
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const closeCard = () => {
    Animated.timing(translateY, {
      toValue: -500, // Move card out of view (upwards) to hide it
      duration: 500,
      useNativeDriver: true,
    }).start();
    setSelectedMarker(null);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 36.8885,
          longitude: 30.7056,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            onPress={() => handleMarkerPress(marker)}
          >
            <View style={styles.marker}>
              <MaterialIcons
                name="local-hospital"
                size={30}
                color="white"
                style={styles.icon}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedMarker && (
        <Animated.View
          style={[styles.card, { transform: [{ translateY }] }]}
          onLayout={() => setCardHeight(screenHeight * 0.4)} // Calculate the card height on render
          {...panResponder.panHandlers} // Allow dragging
        >
          <Text style={styles.cardTitle}>PokeCenter</Text>
          <Image
            source={{
              uri: selectedMarker.image,
            }}
            style={styles.cardImage}
          />
          <Text style={styles.cardAddress}>{selectedMarker.address}</Text>
          <TouchableOpacity style={styles.button} onPress={closeCard}>
            <Text style={styles.buttonText}> 7/24 Açık</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "70%",
  },
  marker: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    position: "absolute",
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  cardImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardAddress: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Location;
