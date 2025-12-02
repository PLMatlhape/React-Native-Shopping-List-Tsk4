// History Screen for React Native
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { storageService } from '../services/storageService';
import type { DailyHistory, HistoryItem } from '../types';

const HistoryScreen: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<DailyHistory[]>([]);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Load history from storage
  const loadHistory = useCallback(async () => {
    const saved = await storageService.getItem<HistoryItem[]>('shoppingHistory');
    if (saved) {
      setHistoryData(saved);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Group history by date and apply filters
  useEffect(() => {
    const groupedByDate = historyData.reduce((acc: { [key: string]: HistoryItem[] }, item) => {
      if (!acc[item.date]) {
        acc[item.date] = [];
      }
      acc[item.date].push(item);
      return acc;
    }, {});

    let dailyHistories: DailyHistory[] = Object.entries(groupedByDate).map(([date, items]) => {
      const addedItems = items.filter((item: HistoryItem) => item.action === 'added');
      const purchasedItems = items.filter((item: HistoryItem) => item.action === 'purchased');
      const removedItems = items.filter((item: HistoryItem) => item.action === 'removed');

      return {
        date,
        items,
        totalAdded: addedItems.length,
        totalPurchased: purchasedItems.length,
        totalSpent: purchasedItems.reduce((sum: number, item: HistoryItem) => {
          const price = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
          const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0;
          return sum + (price * quantity);
        }, 0),
        itemsAdded: addedItems.length,
        itemsPurchased: purchasedItems.length,
        itemsRemoved: removedItems.length,
      };
    });

    // Sort by date (newest first)
    dailyHistories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply filters
    if (filterAction !== 'all') {
      dailyHistories = dailyHistories.map(day => ({
        ...day,
        items: day.items.filter((item: HistoryItem) => item.action === filterAction)
      })).filter(day => day.items.length > 0);
    }

    if (searchTerm) {
      dailyHistories = dailyHistories.map(day => ({
        ...day,
        items: day.items.filter((item: HistoryItem) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(day => day.items.length > 0);
    }

    setFilteredHistory(dailyHistories);
  }, [historyData, filterAction, searchTerm]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Format time
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'added':
        return <Ionicons name="add-circle" size={20} color={COLORS.primary} />;
      case 'purchased':
        return <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />;
      case 'removed':
        return <Ionicons name="remove-circle" size={20} color={COLORS.error} />;
      default:
        return null;
    }
  };

  // Get action label
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'added':
        return 'Added to list';
      case 'purchased':
        return 'Purchased';
      case 'removed':
        return 'Removed';
      default:
        return action;
    }
  };

  // Calculate totals
  const totalSpent = filteredHistory.reduce((sum, day) => sum + day.totalSpent, 0);
  const totalItems = filteredHistory.reduce((sum, day) => sum + day.totalPurchased, 0);

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'added', label: 'Added' },
    { value: 'purchased', label: 'Purchased' },
    { value: 'removed', label: 'Removed' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Ionicons name="time" size={24} color={COLORS.primary} />
          <Text style={styles.title}>Shopping History</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalItems}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>R{totalSpent.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search history..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterButtons.map((button) => (
            <TouchableOpacity
              key={button.value}
              style={[
                styles.filterButton,
                filterAction === button.value && styles.filterButtonActive
              ]}
              onPress={() => setFilterAction(button.value)}
            >
              <Text style={[
                styles.filterButtonText,
                filterAction === button.value && styles.filterButtonTextActive
              ]}>
                {button.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* History List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyStateTitle}>No history yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Your shopping activity will appear here
            </Text>
          </View>
        ) : (
          filteredHistory.map((day) => (
            <View key={day.date} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                <Text style={styles.daySummary}>
                  {day.totalPurchased} purchased · R{day.totalSpent.toFixed(2)}
                </Text>
              </View>
              {day.items.map((item: HistoryItem) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyItemIcon}>
                    {getActionIcon(item.action)}
                  </View>
                  <View style={styles.historyItemContent}>
                    <Text style={styles.historyItemName}>{item.name}</Text>
                    <Text style={styles.historyItemDetails}>
                      {item.quantity} {item.unit} · {item.category}
                    </Text>
                    <Text style={styles.historyItemAction}>
                      {getActionLabel(item.action)} at {formatTime(item.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.historyItemPrice}>
                    R{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 12,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  filters: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  daySection: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  daySummary: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyItemIcon: {
    marginRight: 12,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  historyItemDetails: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  historyItemAction: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 4,
  },
  historyItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default HistoryScreen;
