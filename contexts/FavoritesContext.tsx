import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  cookId: string;
  cookName: string;
  cookRating: number;
  distance: number;
  prepTime: number;
  tags: string[];
  dateAdded: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: Omit<FavoriteItem, 'dateAdded'>) => Promise<void>;
  removeFromFavorites: (itemId: string) => Promise<void>;
  isFavorite: (itemId: string) => boolean;
  clearFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (newFavorites: FavoriteItem[]) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addToFavorites = async (item: Omit<FavoriteItem, 'dateAdded'>) => {
    const favoriteItem: FavoriteItem = {
      ...item,
      dateAdded: new Date().toISOString(),
    };
    
    const newFavorites = [...favorites, favoriteItem];
    await saveFavorites(newFavorites);
  };

  const removeFromFavorites = async (itemId: string) => {
    const newFavorites = favorites.filter(item => item.id !== itemId);
    await saveFavorites(newFavorites);
  };

  const isFavorite = (itemId: string): boolean => {
    return favorites.some(item => item.id === itemId);
  };

  const clearFavorites = async () => {
    await saveFavorites([]);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      clearFavorites,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};