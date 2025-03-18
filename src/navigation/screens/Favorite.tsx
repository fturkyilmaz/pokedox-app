import React, { useContext } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { FavoritesContext } from "../../components/FavoritesProvider";
import useAxios from "../../hooks/useAxios";
import Ionicons from "react-native-vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  useAnimatedGestureHandler,
} from "react-native-reanimated";
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";

interface FavoriteCardProps {
  pokemonName: string;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({ pokemonName }) => {
  const { removeFavorite } = useContext(FavoritesContext);
  interface PokemonData {
    sprites: {
      front_default: string;
    };
    name: string;
  }

  const { data, loading, error } = useAxios<PokemonData>(`pokemon/${pokemonName}`);

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: () => {
      if (translateX.value < -100) {
        translateX.value = withTiming(-500, { duration: 300 }, () => {
          runOnJS(removeFavorite)(pokemonName);
        });
        opacity.value = withTiming(0, { duration: 300 });
      } else {
        translateX.value = withTiming(0, { duration: 300 });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  if (loading || !data) {
    return (
      <View style={styles.favoriteCard}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.favoriteCard}>
        <Text>Error</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      <View style={styles.swipeContainer}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.favoriteCard, animatedStyle]}>
            <Image source={{ uri: data.sprites.front_default }} style={styles.favoriteImage} />
            <View style={styles.favoriteInfo}>
              <Text style={styles.favoriteName}>{data.name.toUpperCase()}</Text>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
};

const Favorite = () => {
  const { favorites } = useContext(FavoritesContext);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favori Pokémon'lar</Text>
      {favorites.length === 0 ? (
        <Text style={styles.noFavorites}>Henüz favori Pokémon eklenmedi.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item}
          renderItem={({ item }) => <FavoriteCard pokemonName={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0f0f0" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  noFavorites: { fontSize: 18, textAlign: "center", marginTop: 20 },
  listContent: { paddingVertical: 8 },
  swipeContainer: { position: "relative", marginBottom: 12 },
  deleteBackground: {
    position: "absolute",
    backgroundColor: "#F44336",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
    borderRadius: 12,
  },
  favoriteCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteImage: { width: 60, height: 60, resizeMode: "contain", borderRadius: 30 },
  favoriteInfo: { flex: 1, marginLeft: 12 },
  favoriteName: { fontSize: 18, fontWeight: "bold" },
});

export default Favorite;
