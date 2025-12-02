// Custom hook for shopping list management in React Native
import { useCallback, useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import type {
    CreateShoppingItemDto,
    ShoppingItem,
    UpdateShoppingItemDto
} from '../types';

export const useShoppingList = (userId: string, listId?: string) => {
  const storageKey = userId ? `shoppingItems_${userId}` : 'shoppingItems';
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items from storage
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = await storageService.getItem<ShoppingItem[]>(storageKey);
      setItems(stored || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  // Load items on mount and when userId changes
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Save items to storage whenever they change
  const saveItems = useCallback(async (newItems: ShoppingItem[]) => {
    await storageService.setItem(storageKey, newItems);
  }, [storageKey]);

  // Add new item
  const addItem = useCallback(async (itemData: CreateShoppingItemDto): Promise<ShoppingItem | null> => {
    try {
      setLoading(true);
      setError(null);
      const newItem: ShoppingItem = {
        ...itemData,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        listId: listId || '',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: itemData.priority ?? 'medium',
      };
      
      const newItems = [...items, newItem];
      setItems(newItems);
      await saveItems(newItems);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      return null;
    } finally {
      setLoading(false);
    }
  }, [items, listId, saveItems]);

  // Update item
  const updateItem = useCallback(async (id: string, updates: UpdateShoppingItemDto): Promise<ShoppingItem | null> => {
    try {
      setLoading(true);
      setError(null);
      let updatedItem: ShoppingItem | null = null;
      
      const newItems = items.map(item => {
        if (item.id === id) {
          updatedItem = { ...item, ...updates, updatedAt: new Date().toISOString() };
          return updatedItem;
        }
        return item;
      });
      
      setItems(newItems);
      await saveItems(newItems);
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      return null;
    } finally {
      setLoading(false);
    }
  }, [items, saveItems]);

  // Delete item
  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const newItems = items.filter(item => item.id !== id);
      setItems(newItems);
      await saveItems(newItems);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      return false;
    } finally {
      setLoading(false);
    }
  }, [items, saveItems]);

  // Toggle item completion
  const toggleItem = useCallback(async (id: string): Promise<ShoppingItem | null> => {
    try {
      setLoading(true);
      setError(null);
      let updatedItem: ShoppingItem | null = null;
      
      const newItems = items.map(item => {
        if (item.id === id) {
          updatedItem = { 
            ...item, 
            isCompleted: !item.isCompleted, 
            updatedAt: new Date().toISOString() 
          };
          return updatedItem;
        }
        return item;
      });
      
      setItems(newItems);
      await saveItems(newItems);
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle item');
      return null;
    } finally {
      setLoading(false);
    }
  }, [items, saveItems]);

  // Clear all items
  const clearItems = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setItems([]);
      await saveItems([]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear items');
      return false;
    } finally {
      setLoading(false);
    }
  }, [saveItems]);

  // Refresh items from storage
  const refreshItems = useCallback(async () => {
    await loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleItem,
    clearItems,
    refreshItems,
  };
};

export default useShoppingList;