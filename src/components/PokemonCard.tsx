// components/PokemonCard.tsx
import React, { useEffect, useState, useContext } from "react";
import { 
  View, 
  Text, 
  Image, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  StyleSheet 
} from "react-native";
import useAxios from "../hooks/useAxios";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FavoritesContext } from "../components/FavoritesProvider";

// Pokémon türlerine göre renkler
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

// Pokémon türlerine göre metin rengi
const typeTextColors: { [key: string]: string } = {
  fire: "white",
  grass: "white",
  water: "white",
  electric: "white",
  psychic: "white",
  bug: "white",
  normal: "white",
  poison: "white",
  ghost: "white",
  ice: "white",
  dragon: "white",
  dark: "white",
  fairy: "white",
  fighting: "white",
  rock: "white",
  ground: "white",
  steel: "white",
  flying: "white",
};

type PokemonCardProps = {
  pokemonName: string;
  onClose: () => void;
};

type PokemonData = {
  id: number;
  name: string;
  sprites: { front_default: string };
  types: { type: { name: string } }[];
  height: number;
  weight: number;
  abilities: { ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
};

type AnimatedStatBarProps = {
  baseStat: number;
  visible: boolean;
};

const AnimatedStatBar: React.FC<AnimatedStatBarProps> = ({ baseStat, visible }) => {
  const statValue = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      statValue.value = withTiming(baseStat, {
        duration: 1000,
        easing: Easing.ease,
      });
    }
  }, [baseStat, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${statValue.value}%`,
  }));

  return (
    <View style={styles.statBarContainer}>
      <Animated.View style={[styles.statBar, animatedStyle]} />
    </View>
  );
};

// AnimatedFavoriteIcon bileşeni: ikon dokunulduğunda scale animasyonu uygular.
type AnimatedFavoriteIconProps = {
  isFavorite: boolean;
  onPress: () => void;
};

const AnimatedFavoriteIcon: React.FC<AnimatedFavoriteIconProps> = ({ isFavorite, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
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

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemonName, onClose }) => {
  const { data, loading, error } = useAxios(`pokemon/${pokemonName}`);
  const { data: speciesData } = useAxios<{ flavor_text_entries: { language: { name: string }; flavor_text: string }[] }>(`pokemon-species/${pokemonName}`);
  const pokemon = data as PokemonData;
  const description = speciesData?.flavor_text_entries?.[0]?.flavor_text || "No description available.";
  const [statsVisible, setStatsVisible] = useState(false);
  const [statsPosition, setStatsPosition] = useState(0);
  const windowHeight = Dimensions.get("window").height;

  const { favorites, addFavorite, removeFavorite } = useContext(FavoritesContext);
  const isFavorite = pokemon ? favorites.includes(pokemon.name) : false;

  return (
    <Modal transparent={true} animationType="slide">
      <View style={styles.modalBackground}>
        <View style={[styles.modalContainer, { position: "relative" }]}>
          {/* Favori İkonu: Modal container'ın sağ üst köşesinde */}
          <AnimatedFavoriteIcon
            isFavorite={isFavorite}
            onPress={() => {
              if (isFavorite) {
                removeFavorite(pokemon.name);
              } else {
                addFavorite(pokemon.name);
              }
            }}
          />
          {loading && <Text>Loading...</Text>}
          {error && <Text>Error: {error}</Text>}
          {pokemon && (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 24 }}
              scrollEventThrottle={16}
              onScroll={(event) => {
                const offsetY = event.nativeEvent.contentOffset.y;
                if (offsetY + windowHeight >= statsPosition + 50 && !statsVisible) {
                  setStatsVisible(true);
                }
              }}
            >
              {/* Pokémon Resmi */}
              <Image
                source={{ uri: pokemon.sprites?.front_default }}
                style={styles.pokemonImage}
              />
              {/* Pokémon Adı ve Türler */}
              <Text style={styles.pokemonName}>{pokemon.name.toUpperCase()}</Text>
              <View style={styles.typeContainer}>
                {pokemon.types.map((t) => (
                  <View
                    key={t.type.name}
                    style={[styles.typeBadge, { backgroundColor: typeColors[t.type.name] }]}
                  >
                    <Text style={[styles.typeBadgeText, { color: typeTextColors[t.type.name] }]}>
                      {t.type.name.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
              {/* Açıklama */}
              <Text style={styles.description}>{description}</Text>
              {/* Boy ve Kilo */}
              <View style={styles.sizeContainer}>
                <View style={styles.sizeItem}>
                  <Text style={styles.sizeTitle}>Height</Text>
                  <Text style={styles.sizeValue}>{pokemon.height / 10} m</Text>
                </View>
                <View style={styles.sizeItem}>
                  <Text style={styles.sizeTitle}>Weight</Text>
                  <Text style={styles.sizeValue}>{pokemon.weight / 10} kg</Text>
                </View>
              </View>
              {/* Yetenekler */}
              <View style={styles.abilityContainer}>
                <Text style={styles.sectionTitle}>Abilities</Text>
                <View style={styles.abilityList}>
                  {pokemon.abilities.map((ability) => (
                    <View key={ability.ability.name} style={styles.abilityBadge}>
                      <Text style={styles.abilityText}>{ability.ability.name.toUpperCase()}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {/* İstatistikler */}
              <View
                onLayout={(event) => {
                  setStatsPosition(event.nativeEvent.layout.y);
                }}
                style={styles.statsContainer}
              >
                <Text style={styles.sectionTitle}>Statistics</Text>
                <View style={styles.statsList}>
                  {pokemon.stats.map((stat) => (
                    <View key={stat.stat.name} style={styles.statItem}>
                      <Text style={styles.statName}>{stat.stat.name.toUpperCase()}</Text>
                      <AnimatedStatBar baseStat={stat.base_stat} visible={statsVisible} />
                      <Text style={styles.statValue}>{stat.base_stat}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {/* Kapat Butonu */}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
  },
  pokemonImage: {
    width: 192,
    height: 192,
    resizeMode: "contain",
    borderRadius: 16,
    alignSelf: "center",
  },
  pokemonName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4c51bf",
    textAlign: "center",
    marginTop: 16,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
  },
  typeBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    margin: 4,
  },
  typeBadgeText: {
    fontWeight: "600",
  },
  description: {
    marginTop: 24,
    fontSize: 18,
    textAlign: "center",
    color: "#4A5568",
  },
  sizeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  sizeItem: {
    alignItems: "center",
    width: "30%",
  },
  sizeTitle: {
    fontWeight: "600",
    fontSize: 18,
  },
  sizeValue: {
    fontSize: 18,
    color: "#4A5568",
  },
  abilityContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  abilityList: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 8,
  },
  abilityBadge: {
    backgroundColor: "#FBD38D",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    margin: 4,
  },
  abilityText: {
    fontWeight: "600",
    color: "#C05621",
  },
  statsContainer: {
    marginTop: 24,
  },
  statsList: {
    marginTop: 16,
    paddingBottom: 16,
  },
  statItem: {
    marginBottom: 16,
  },
  statName: {
    fontWeight: "600",
    fontSize: 18,
  },
  statBarContainer: {
    height: 24,
    backgroundColor: "#EDF2F7",
    borderRadius: 8,
    overflow: "hidden",
  },
  statBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  statValue: {
    fontSize: 18,
    color: "#4A5568",
    textAlign: "right",
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 12,
    backgroundColor: "#F56565",
    borderRadius: 16,
  },
  closeButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  animatedIconContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F44336",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  iconTouchable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PokemonCard;
