// History Slice - Tracks all shopping actions
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storageService } from '../../services/storageService';
import type { DailyHistory, HistoryItem, ShoppingItem } from '../../types';
import type { HistoryState, RootState } from '../types';

const initialState: HistoryState = {
  items: [],
  dailyHistory: [],
  loading: false,
  error: null,
  filterAction: 'all',
};

const getStorageKey = (userId: string) => `shoppingHistory_${userId}`;

// Group history items by date
const groupByDate = (items: HistoryItem[]): DailyHistory[] => {
  const grouped: { [date: string]: HistoryItem[] } = {};

  items.forEach((item) => {
    const date = item.date;
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(item);
  });

  return Object.entries(grouped)
    .map(([date, items]) => ({
      date,
      items: items.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      totalAdded: items.filter((i) => i.action === 'added').length,
      totalPurchased: items.filter((i) => i.action === 'purchased').length,
      totalSpent: items
        .filter((i) => i.action === 'purchased')
        .reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemsAdded: items.filter((i) => i.action === 'added').length,
      itemsPurchased: items.filter((i) => i.action === 'purchased').length,
      itemsRemoved: items.filter((i) => i.action === 'removed').length,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Async thunks
export const loadHistory = createAsyncThunk(
  'history/loadHistory',
  async (userId: string) => {
    const items = await storageService.getItem<HistoryItem[]>(getStorageKey(userId));
    return items || [];
  }
);

export const addHistoryEntry = createAsyncThunk(
  'history/addHistoryEntry',
  async (
    { item, action, userId }: { item: ShoppingItem; action: 'added' | 'purchased' | 'removed'; userId: string },
    { getState }
  ) => {
    const state = getState() as { history: HistoryState };
    const currentHistory = state.history.items;

    const now = new Date();
    const historyEntry: HistoryItem = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      priority: item.priority,
      notes: item.notes,
      image: item.image,
      listId: item.listId,
      isCompleted: item.isCompleted,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      action,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
    };

    const updatedHistory = [historyEntry, ...currentHistory];
    await storageService.setItem(getStorageKey(userId), updatedHistory);

    return historyEntry;
  }
);

export const clearHistory = createAsyncThunk(
  'history/clearHistory',
  async (userId: string) => {
    await storageService.removeItem(getStorageKey(userId));
    return [];
  }
);

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setFilterAction: (state, action: PayloadAction<'all' | 'added' | 'purchased' | 'removed'>) => {
      state.filterAction = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load History
      .addCase(loadHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.dailyHistory = groupByDate(action.payload);
      })
      .addCase(loadHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load history';
      })
      // Add History Entry
      .addCase(addHistoryEntry.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.dailyHistory = groupByDate(state.items);
      })
      // Clear History
      .addCase(clearHistory.fulfilled, (state) => {
        state.items = [];
        state.dailyHistory = [];
      });
  },
});

// Selectors - Memoized for performance
const selectDailyHistory = (state: RootState) => state.history.dailyHistory;
const selectHistoryItems = (state: RootState) => state.history.items;
const selectFilterActionState = (state: RootState) => state.history.filterAction;

export const selectFilteredHistory = createSelector(
  [selectDailyHistory, selectFilterActionState],
  (dailyHistory, filterAction) => {
    if (filterAction === 'all') {
      return dailyHistory;
    }

    return dailyHistory
      .map((day) => ({
        ...day,
        items: day.items.filter((item) => item.action === filterAction),
      }))
      .filter((day) => day.items.length > 0);
  }
);

export const selectHistoryStats = createSelector(
  [selectHistoryItems],
  (items) => {
    return {
      totalAdded: items.filter((i) => i.action === 'added').length,
      totalPurchased: items.filter((i) => i.action === 'purchased').length,
      totalRemoved: items.filter((i) => i.action === 'removed').length,
      totalSpent: items
        .filter((i) => i.action === 'purchased')
        .reduce((sum, i) => sum + i.price * i.quantity, 0),
    };
  }
);

export const selectCompletedOrders = createSelector(
  [selectHistoryItems],
  (items) => items.filter((item) => item.action === 'purchased')
);

export const { setFilterAction } = historySlice.actions;
export default historySlice.reducer;
