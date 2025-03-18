import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import useAxios from "../../hooks/useAxios";
import PokemonCard from "../../components/PokemonCard";
import { FavoritesContext } from "../../components/FavoritesProvider";
import Ionicons from "react-native-vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

// AnimatedFavoriteIcon bileşeni: ikon dokunulduğunda scale animasyonu uygular.
type AnimatedFavoriteIconProps = {
  isFavorite: boolean;
  onPress: () => void;
};

const AnimatedFavoriteIcon: React.FC<AnimatedFavoriteIconProps> = ({
  isFavorite,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    // Animasyonu tetikle
    scale.value = withTiming(1.2, { duration: 150, easing: Easing.out(Easing.ease) }, () => {
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
    });
    onPress();
  };

  return (
    <Animated.View style={[styles.animatedIconContainer, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} style={styles.iconTouchable}>
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={20}
          color={isFavorite ? "#F44336" : "#000"}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const Search = () => {
  const { data, loading, error } = useAxios("pokemon?limit=1000");
  const pokemonList = (data as { results: { name: string; url: string }[] })?.results || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);
  const [pokemonTypes, setPokemonTypes] = useState<{ [key: string]: string[] }>({});

  const { addFavorite, removeFavorite, favorites } = useContext(FavoritesContext);

  // Pokémon türlerini alacak fonksiyon
  const fetchPokemonTypes = async () => {
    for (const pokemon of pokemonList) {
      const response = await fetch(pokemon.url);
      const pokemonData = await response.json();
      const types = pokemonData.types.map(
        (type: { type: { name: string } }) => type.type.name
      );
      setPokemonTypes((prev) => ({ ...prev, [pokemon.name]: types }));
    }
  };

  useEffect(() => {
    fetchPokemonTypes();
  }, [pokemonList]);

  const filteredPokemon = pokemonList.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTypeButtons = (types: string[]) => {
    return types.map((type) => (
      <View key={type} style={[styles.typeButton, { backgroundColor: getTypeColor(type) }]}>
        <Text style={styles.typeText}>{type}</Text>
      </View>
    ));
  };

  const getTypeColor = (type: string) => {
    const typeColors: { [key: string]: string } = {
      fire: "#f08030",
      grass: "#78c850",
      water: "#6890f0",
      electric: "#f8d030",
      psychic: "#f85888",
      bug: "#a8b820",
      normal: "#a8a878",
      poison: "#a040a0",
      ghost: "#705898",
      ice: "#98d8d8",
      dragon: "#7038f8",
      dark: "#705848",
      fairy: "#ee99ac",
      fighting: "#c03028",
      rock: "#b8a038",
      ground: "#e0c068",
      steel: "#b8b8d0",
      flying: "#a890f0",
    };
    return typeColors[type] || "#d3d3d3";
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/2560px-International_Pok%C3%A9mon_logo.svg.png",
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      <TextInput
        style={styles.searchBar}
        placeholder="Pokémon Ara..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#000"
      />

      {loading && <Text>Yükleniyor...</Text>}
      {error && <Text>Hata: {error}</Text>}

      <FlatList
        data={filteredPokemon}
        keyExtractor={(item) => item.name}
        numColumns={3}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const pokemonId = item.url.split("/")[6];
          const types = pokemonTypes[item.name] || [];
          const isFavorite = favorites.includes(item.name);

          return (
            <View style={styles.cardContainer}>
              <View style={styles.cardWrapper}>
                <TouchableOpacity
                  style={styles.pokemonCard}
                  onPress={() => setSelectedPokemon(item.name)}
                >
                  <Image
                    source={{
                      uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
                    }}
                    style={styles.pokemonImage}
                  />
                  <Text style={styles.pokemonName}>{item.name}</Text>
                  <View style={styles.typeContainer}>{renderTypeButtons(types)}</View>
                </TouchableOpacity>
                <AnimatedFavoriteIcon
                  isFavorite={isFavorite}
                  onPress={() => {
                    if (isFavorite) {
                      removeFavorite(item.name);
                    } else {
                      addFavorite(item.name);
                    }
                  }}
                />
              </View>
            </View>
          );
        }}
      />

      {selectedPokemon && (
        <PokemonCard
          pokemonName={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
  searchBar: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 18,
  },
  logo: {
    width: 200,
    height: 80,
    alignSelf: "center",
    marginBottom: 16,
  },
  row: {
    justifyContent: "space-evenly",
    marginTop: 10,
  },
  cardContainer: {
    width: "30%",
    alignItems: "center",
    marginBottom: 12,
  },
  cardWrapper: {
    position: "relative",
    width: "100%",
  },
  pokemonCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    elevation: 2,
  },
  pokemonImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    textTransform: "capitalize",
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 8,
  },
  typeButton: {
    padding: 6,
    margin: 4,
    borderRadius: 12,
  },
  typeText: {
    fontWeight: "600",
    color: "#fff",
  },
  animatedIconContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#F44336",
  },
  iconTouchable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Search;
