// context/FavoritesContext.tsx
import React, { createContext, useState, ReactNode } from "react";

type FavoritesContextType = {
  favorites: string[];
  addFavorite: (pokemonName: string) => void;
  removeFavorite: (pokemonName: string) => void;
};

export const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
});

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const addFavorite = (pokemonName: string) => {
    setFavorites((prev) => {
      if (!prev.includes(pokemonName)) {
        return [...prev, pokemonName];
      }
      return prev;
    });
  };

  const removeFavorite = (pokemonName: string) => {
    setFavorites((prev) => prev.filter((name) => name !== pokemonName));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
