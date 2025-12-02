// History Screen with Redux integration
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Platform,
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
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    loadHistory,
    selectFilteredHistory,
    selectHistoryStats,
    setFilterAction,
} from '../store/slices/historySlice';
import type { DailyHistory, HistoryItem } from '../types';

const HistoryScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const user = useAppSelector((state) => state.auth.user);
  const filterAction = useAppSelector((state) => state.history.filterAction);
  const filteredHistory = useAppSelector(selectFilteredHistory);
  const stats = useAppSelector(selectHistoryStats);
  const loading = useAppSelector((state) => state.history.loading);

  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [displayHistory, setDisplayHistory] = useState<DailyHistory[]>([]);

  // Load history on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(loadHistory(user.id));
    }
  }, [dispatch, user?.id]);

  // Apply search filter on top of Redux filtered history
  useEffect(() => {
    if (!searchTerm) {
      setDisplayHistory(filteredHistory);
    } else {
      const filtered = filteredHistory
        .map((day) => ({
          ...day,
          items: day.items.filter(
            (item) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.category.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        }))
        .filter((day) => day.items.length > 0);
      setDisplayHistory(filtered);
    }
  }, [filteredHistory, searchTerm]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await dispatch(loadHistory(user.id));
    setRefreshing(false);
  }, [dispatch, user?.id]);

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
        day: 'numeric',
      });
    }
  };

  // Format time
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'added':
        return <Ionicons name="add-circle" size={24} color={COLORS.primary} />;
      case 'purchased':
        return <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />;
      case 'removed':
        return <Ionicons name="remove-circle" size={24} color={COLORS.error} />;
      default:
        return <Ionicons name="ellipse" size={24} color={COLORS.textSecondary} />;
    }
  };

  // Get action color
  const getActionColor = (action: string) => {
    switch (action) {
      case 'added':
        return COLORS.primary;
      case 'purchased':
        return COLORS.success;
      case 'removed':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const filterButtons: { value: 'all' | 'added' | 'purchased' | 'removed'; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: 'list' },
    { value: 'added', label: 'Added', icon: 'add-circle' },
    { value: 'purchased', label: 'Purchased', icon: 'checkmark-circle' },
    { value: 'removed', label: 'Removed', icon: 'remove-circle' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitle}>
            <Ionicons name="time" size={28} color={COLORS.primary} />
            <Text style={styles.title}>Shopping History</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: COLORS.primary + '15' }]}>
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{stats.totalAdded}</Text>
            <Text style={styles.statLabel}>Added</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>{stats.totalPurchased}</Text>
            <Text style={styles.statLabel}>Purchased</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.error + '15' }]}>
            <Ionicons name="remove-circle" size={24} color={COLORS.error} />
            <Text style={styles.statNumber}>{stats.totalRemoved}</Text>
            <Text style={styles.statLabel}>Removed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.accent + '15' }]}>
            <Ionicons name="wallet" size={24} color={COLORS.accent} />
            <Text style={styles.statNumber}>R{stats.totalSpent.toFixed(0)}</Text>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          {filterButtons.map((button) => (
            <TouchableOpacity
              key={button.value}
              style={[
                styles.filterButton,
                filterAction === button.value && styles.filterButtonActive,
              ]}
              onPress={() => dispatch(setFilterAction(button.value))}
            >
              <Ionicons
                name={button.icon as any}
                size={16}
                color={filterAction === button.value ? COLORS.white : COLORS.text}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  filterAction === button.value && styles.filterButtonTextActive,
                ]}
              >
                {button.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* History List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {loading && displayHistory.length === 0 ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : displayHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIconContainer}>
              <Ionicons name="document-text-outline" size={64} color={COLORS.textLight} />
            </View>
            <Text style={styles.emptyStateTitle}>No history yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Your shopping activity will appear here.
            </Text>
            <Text style={styles.emptyStateHint}>
              Add items to your list, purchase them, or remove them to see history.
            </Text>
          </View>
        ) : (
          displayHistory.map((day) => (
            <View key={day.date} style={styles.daySection}>
              {/* Day Header */}
              <View style={styles.dayHeader}>
                <View style={styles.dayHeaderLeft}>
                  <Ionicons name="calendar" size={18} color={COLORS.primary} />
                  <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                </View>
                <View style={styles.dayStats}>
                  <View style={styles.dayStatItem}>
                    <Ionicons name="checkmark" size={14} color={COLORS.success} />
                    <Text style={styles.dayStatText}>{day.itemsPurchased}</Text>
                  </View>
                  <Text style={styles.daySummary}>R{day.totalSpent.toFixed(2)}</Text>
                </View>
              </View>

              {/* Day Items */}
              {day.items.map((item: HistoryItem) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyItemIcon}>{getActionIcon(item.action)}</View>
                  <View style={styles.historyItemContent}>
                    <View style={styles.historyItemHeader}>
                      <Text style={styles.historyItemName}>{item.name}</Text>
                      <View
                        style={[
                          styles.actionBadge,
                          { backgroundColor: getActionColor(item.action) + '15' },
                        ]}
                      >
                        <Text
                          style={[styles.actionBadgeText, { color: getActionColor(item.action) }]}
                        >
                          {item.action}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.historyItemDetails}>
                      {item.quantity} {item.unit} · {item.category}
                    </Text>
                    <View style={styles.historyItemFooter}>
                      <Text style={styles.historyItemTime}>
                        <Ionicons name="time-outline" size={12} color={COLORS.textLight} />{' '}
                        {formatTime(item.timestamp)}
                      </Text>
                      <Text style={styles.historyItemPrice}>
                        R{(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
        <View style={styles.bottomPadding} />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    marginBottom: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  filters: {
    paddingVertical: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
    ...Platform.select({
      web: { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateHint: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  daySection: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary + '08',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  dayStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  dayStatText: {
    fontSize: 14,
    color: COLORS.success,
    marginLeft: 4,
  },
  daySummary: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  historyItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyItemIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  historyItemDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  historyItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  historyItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bottomPadding: {
    height: 100,
  },
});

export default HistoryScreen;
