// Dashboard Screen with Redux integration
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddItemModal from '../Components/AddItemModal';
import ShoppingItemCard from '../Components/ShoppingItemCard';
import { AVATAR_OPTIONS, CATEGORIES, COLORS, DEFAULT_AVATAR } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadHistory } from '../store/slices/historySlice';
import {
    addItem,
    deleteItem,
    loadItems,
    selectFilteredItems,
    selectStats,
    setCategory,
    setFilter,
    setSearchTerm,
    toggleFavorite,
    toggleItem,
} from '../store/slices/shoppingSlice';
import type { CreateShoppingItemDto, FilterType, ShoppingItem } from '../types';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const { activeFilter, selectedCategory } = useAppSelector((state) => state.shopping);
  const filteredItems = useAppSelector(selectFilteredItems);
  const stats = useAppSelector(selectStats);

  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Load items on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(loadItems(user.id));
      dispatch(loadHistory(user.id));
    }
  }, [dispatch, user?.id]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchTerm(localSearchTerm));
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchTerm, dispatch]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await dispatch(loadItems(user.id));
    setRefreshing(false);
  }, [dispatch, user?.id]);

  // Handle filter click
  const handleFilterClick = (filter: FilterType) => {
    dispatch(setFilter(filter === activeFilter ? 'all' : filter));
  };

  // Handle category click
  const handleCategoryClick = (categoryId: string) => {
    dispatch(setCategory(categoryId === selectedCategory ? 'All' : categoryId));
  };

  // Handle add item
  const handleAddItem = async (itemData: CreateShoppingItemDto) => {
    if (!user?.id) return;
    await dispatch(addItem({ userId: user.id, item: itemData }));
    setShowAddModal(false);
  };

  // Handle toggle item
  const handleToggleItem = async (itemId: string) => {
    if (!user?.id) return;
    await dispatch(toggleItem({ userId: user.id, itemId }));
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (itemId: string) => {
    if (!user?.id) return;
    await dispatch(toggleFavorite({ userId: user.id, itemId }));
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!user?.id) return;
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await dispatch(deleteItem({ userId: user.id, itemId }));
        },
      },
    ]);
  };

  // Get user avatar
  const userAvatar = user?.avatar
    ? AVATAR_OPTIONS.find((a) => a.id === user.avatar)?.image || DEFAULT_AVATAR
    : DEFAULT_AVATAR;

  // Calculate progress
  const totalItems = stats.completed + stats.pending;
  const progress = totalItems > 0 ? (stats.completed / totalItems) * 100 : 0;

  // Get filter title
  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'completed':
        return 'Completed Items';
      case 'pending':
        return 'Pending Items';
      case 'high':
        return 'High Priority Items';
      case 'favorites':
        return 'Favorite Items';
      default:
        return 'My Shopping List';
    }
  };

  const renderCategoryItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.categoryCardActive,
      ]}
      onPress={() => handleCategoryClick(item.id)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.categoryEmoji}>{item.icon}</Text>
      </View>
      <Text
        style={[
          styles.categoryName,
          selectedCategory === item.id && styles.categoryNameActive,
        ]}
        numberOfLines={1}
      >
        {item.name.substring(0, 5)}
      </Text>
    </TouchableOpacity>
  );

  const renderShoppingItem = ({ item }: { item: ShoppingItem }) => (
    <ShoppingItemCard
      item={item}
      onToggle={() => handleToggleItem(item.id)}
      onDelete={() => handleDeleteItem(item.id)}
      onFavorite={() => handleToggleFavorite(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={userAvatar} style={styles.avatar} />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Hello, {user?.name || 'Guest'}!</Text>
            <Text style={styles.subGreeting}>What do you need</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          {stats.pending > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {stats.pending > 9 ? '9+' : stats.pending}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your grocery products..."
            placeholderTextColor={COLORS.textSecondary}
            value={localSearchTerm}
            onChangeText={setLocalSearchTerm}
          />
          {localSearchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setLocalSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <FlatList
            data={CATEGORIES.slice(0, 8)}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() => setShowCategoryModal(true)}
              >
                <Ionicons name="grid-outline" size={20} color={COLORS.primary} />
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            }
          />
        </View>

        {/* Stats Cards - Clickable Filters */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[
                styles.statCard,
                styles.statCardGreen,
                activeFilter === 'completed' && styles.statCardActive,
              ]}
              onPress={() => handleFilterClick('completed')}
            >
              <View style={[styles.statIcon, { backgroundColor: COLORS.success }]}>
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
              </View>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statCard,
                styles.statCardOrange,
                activeFilter === 'pending' && styles.statCardActive,
              ]}
              onPress={() => handleFilterClick('pending')}
            >
              <View style={[styles.statIcon, { backgroundColor: COLORS.warning }]}>
                <Ionicons name="time" size={20} color={COLORS.white} />
              </View>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[
                styles.statCard,
                styles.statCardRed,
                activeFilter === 'high' && styles.statCardActive,
              ]}
              onPress={() => handleFilterClick('high')}
            >
              <View style={[styles.statIcon, { backgroundColor: COLORS.error }]}>
                <Ionicons name="flash" size={20} color={COLORS.white} />
              </View>
              <Text style={styles.statNumber}>{stats.highPriority}</Text>
              <Text style={styles.statLabel}>High</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statCard,
                styles.statCardBlue,
                activeFilter === 'favorites' && styles.statCardActive,
              ]}
              onPress={() => handleFilterClick('favorites')}
            >
              <View style={[styles.statIcon, { backgroundColor: COLORS.accent }]}>
                <Ionicons name="heart" size={20} color={COLORS.white} />
              </View>
              <Text style={styles.statNumber}>{stats.favorites}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              Progress: {Math.round(progress)}% Complete
            </Text>
            <Text style={styles.progressCount}>
              {stats.completed} of {totalItems}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Shopping List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{getFilterTitle()}</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {activeFilter !== 'all' && (
            <TouchableOpacity
              style={styles.clearFilterBtn}
              onPress={() => dispatch(setFilter('all'))}
            >
              <Ionicons name="close-circle" size={16} color={COLORS.primary} />
              <Text style={styles.clearFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          )}

          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={60} color={COLORS.textLight} />
              <Text style={styles.emptyStateText}>
                {activeFilter !== 'all'
                  ? `No ${activeFilter} items found`
                  : 'Your shopping list is empty'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Tap &quot;Add Item&quot; to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderShoppingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.itemsList}
            />
          )}
        </View>
      </ScrollView>

      {/* Add Item Modal */}
      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
        categories={CATEGORIES}
      />

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.categoryModal}>
            <View style={styles.categoryModalHeader}>
              <Text style={styles.categoryModalTitle}>All Categories</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.categoryGrid}>
              <TouchableOpacity
                style={[
                  styles.categoryGridItem,
                  selectedCategory === 'All' && styles.categoryGridItemActive,
                ]}
                onPress={() => {
                  dispatch(setCategory('All'));
                  setShowCategoryModal(false);
                }}
              >
                <View style={[styles.categoryGridIcon, { backgroundColor: COLORS.primary + '20' }]}>
                  <Ionicons name="apps" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.categoryGridName}>All</Text>
              </TouchableOpacity>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryGridItem,
                    selectedCategory === category.id && styles.categoryGridItemActive,
                  ]}
                  onPress={() => {
                    dispatch(setCategory(category.id));
                    setShowCategoryModal(false);
                  }}
                >
                  <View style={[styles.categoryGridIcon, { backgroundColor: category.color + '20' }]}>
                    <Text style={{ fontSize: 24 }}>{category.icon}</Text>
                  </View>
                  <Text style={styles.categoryGridName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerText: {},
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  categoriesSection: {
    marginTop: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    minWidth: 70,
  },
  categoryCardActive: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  seeAllBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '10',
    minWidth: 70,
  },
  seeAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 6,
  },
  statCardActive: {
    borderWidth: 2,
    borderColor: COLORS.text,
  },
  statCardGreen: {
    backgroundColor: '#E8F5E9',
  },
  statCardOrange: {
    backgroundColor: '#FFF3E0',
  },
  statCardRed: {
    backgroundColor: '#FFEBEE',
  },
  statCardBlue: {
    backgroundColor: '#E0F7FA',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  listSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 6,
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearFilterText: {
    color: COLORS.primary,
    marginLeft: 6,
    fontSize: 14,
  },
  itemsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  categoryModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  categoryGridItem: {
    width: (width - 48) / 3,
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
  },
  categoryGridItemActive: {
    backgroundColor: COLORS.primary + '15',
  },
  categoryGridIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryGridName: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default DashboardScreen;
