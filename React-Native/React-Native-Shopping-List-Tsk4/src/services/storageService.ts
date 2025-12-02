// Storage service for React Native using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // Get item from storage
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  // Set item in storage
  async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      return false;
    }
  }

  // Remove item from storage
  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  }

  // Clear all storage
  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Get multiple items
  async getMultiple<T>(keys: string[]): Promise<{ [key: string]: T | null }> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: { [key: string]: T | null } = {};
      pairs.forEach(([key, value]) => {
        result[key] = value ? JSON.parse(value) : null;
      });
      return result;
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  }

  // Set multiple items
  async setMultiple<T>(items: { [key: string]: T }): Promise<boolean> {
    try {
      const pairs: [string, string][] = Object.entries(items).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Error setting multiple items:', error);
      return false;
    }
  }

  // Get all keys
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }
}

export const storageService = new StorageService();
export default storageService;
