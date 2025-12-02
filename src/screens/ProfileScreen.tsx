// Profile Screen with Redux integration and Orders View
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AVATAR_OPTIONS, COLORS, DEFAULT_AVATAR } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signOut, updateUser } from '../store/slices/authSlice';
import { loadHistory, selectCompletedOrders, selectHistoryStats } from '../store/slices/historySlice';
import { selectStats } from '../store/slices/shoppingSlice';
import type { HistoryItem } from '../types';

type ActiveTab = 'profile' | 'orders' | 'favorites';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const orders = useAppSelector(selectCompletedOrders);
  const historyStats = useAppSelector(selectHistoryStats);
  const shoppingStats = useAppSelector(selectStats);

  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editedData, setEditedData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    cellNumber: user?.cellNumber || '',
    avatar: user?.avatar || 'boy',
  });
  const [loading, setLoading] = useState(false);

  // Load history for orders
  useEffect(() => {
    if (user?.id) {
      dispatch(loadHistory(user.id));
    }
  }, [dispatch, user?.id]);

  // Get user avatar
  const userAvatar = user?.avatar
    ? AVATAR_OPTIONS.find((a) => a.id === user.avatar)?.image || DEFAULT_AVATAR
    : DEFAULT_AVATAR;

  const handleSave = async () => {
    setLoading(true);
    try {
      await dispatch(updateUser(editedData)).unwrap();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await dispatch(signOut());
          router.replace('/');
        },
      },
    ]);
  };

  const selectAvatar = (avatarId: string) => {
    setEditedData((prev) => ({ ...prev, avatar: avatarId }));
    setShowAvatarPicker(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Group orders by date
  const groupedOrders = orders.reduce((acc: { [key: string]: HistoryItem[] }, order) => {
    const date = order.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(order);
    return acc;
  }, {});

  const orderDates = Object.keys(groupedOrders).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Get items marked as favorite
  const favoriteItems = useAppSelector((state) =>
    state.shopping.items.filter((item) => item.isFavorite)
  );

  const renderOrderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderItemIcon}>
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
      </View>
      <View style={styles.orderItemContent}>
        <Text style={styles.orderItemName}>{item.name}</Text>
        <Text style={styles.orderItemDetails}>
          {item.quantity} {item.unit} · {item.category}
        </Text>
      </View>
      <Text style={styles.orderItemPrice}>R{(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  const renderFavoriteItem = ({ item }: { item: typeof favoriteItems[0] }) => (
    <View style={styles.favoriteItem}>
      <Ionicons name="heart" size={20} color={COLORS.error} />
      <View style={styles.favoriteItemContent}>
        <Text style={styles.favoriteItemName}>{item.name}</Text>
        <Text style={styles.favoriteItemDetails}>
          {item.quantity} {item.unit} · {item.category}
        </Text>
      </View>
      <Text style={styles.favoriteItemPrice}>R{item.price.toFixed(2)}</Text>
    </View>
  );

  const tabs: { key: ActiveTab; label: string; icon: string }[] = [
    { key: 'profile', label: 'Profile', icon: 'person' },
    { key: 'orders', label: 'Orders', icon: 'receipt' },
    { key: 'favorites', label: 'Favorites', icon: 'heart' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Account</Text>
        {activeTab === 'profile' && (
          <TouchableOpacity
            onPress={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={loading}
          >
            <Text style={styles.editButton}>
              {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Summary Card */}
      <View style={styles.profileSummary}>
        <Image source={userAvatar} style={styles.summaryAvatar} />
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryName}>
            {user?.name} {user?.surname}
          </Text>
          <Text style={styles.summaryEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{historyStats.totalPurchased}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{shoppingStats.favorites}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>R{historyStats.totalSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab.key);
              setIsEditing(false);
            }}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {activeTab === 'profile' && (
          <>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => isEditing && setShowAvatarPicker(true)}
                disabled={!isEditing}
              >
                <Image source={userAvatar} style={styles.avatar} />
                {isEditing && (
                  <View style={styles.avatarEditBadge}>
                    <Ionicons name="camera" size={16} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>

              {isEditing ? (
                <View style={styles.editForm}>
                  <View style={styles.row}>
                    <View style={[styles.inputContainer, styles.halfInput]}>
                      <Text style={styles.inputLabel}>First Name</Text>
                      <TextInput
                        style={styles.input}
                        value={editedData.name}
                        onChangeText={(text) =>
                          setEditedData((prev) => ({ ...prev, name: text }))
                        }
                        placeholder="First Name"
                        placeholderTextColor={COLORS.textSecondary}
                      />
                    </View>
                    <View style={[styles.inputContainer, styles.halfInput]}>
                      <Text style={styles.inputLabel}>Surname</Text>
                      <TextInput
                        style={styles.input}
                        value={editedData.surname}
                        onChangeText={(text) =>
                          setEditedData((prev) => ({ ...prev, surname: text }))
                        }
                        placeholder="Surname"
                        placeholderTextColor={COLORS.textSecondary}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={editedData.email}
                      onChangeText={(text) =>
                        setEditedData((prev) => ({ ...prev, email: text }))
                      }
                      placeholder="Email"
                      placeholderTextColor={COLORS.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Cell Number</Text>
                    <TextInput
                      style={styles.input}
                      value={editedData.cellNumber}
                      onChangeText={(text) =>
                        setEditedData((prev) => ({ ...prev, cellNumber: text }))
                      }
                      placeholder="Cell Number"
                      placeholderTextColor={COLORS.textSecondary}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.profileInfo}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.infoText}>
                      {user?.name} {user?.surname}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.infoText}>{user?.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.infoText}>{user?.cellNumber}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.infoText}>
                      Member since {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'orders' && (
          <View style={styles.ordersContainer}>
            {orders.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={64} color={COLORS.textLight} />
                <Text style={styles.emptyStateTitle}>No orders yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Items you purchase will appear here
                </Text>
              </View>
            ) : (
              orderDates.map((date) => (
                <View key={date} style={styles.orderGroup}>
                  <View style={styles.orderGroupHeader}>
                    <Text style={styles.orderGroupDate}>{formatDate(date)}</Text>
                    <Text style={styles.orderGroupTotal}>
                      {groupedOrders[date].length} items · R
                      {groupedOrders[date]
                        .reduce((sum, o) => sum + o.price * o.quantity, 0)
                        .toFixed(2)}
                    </Text>
                  </View>
                  <FlatList
                    data={groupedOrders[date]}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'favorites' && (
          <View style={styles.favoritesContainer}>
            {favoriteItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={64} color={COLORS.textLight} />
                <Text style={styles.emptyStateTitle}>No favorites yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Tap the heart icon on items to add them to favorites
                </Text>
              </View>
            ) : (
              <FlatList
                data={favoriteItems}
                renderItem={renderFavoriteItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Avatar Picker Modal */}
      <Modal
        visible={showAvatarPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAvatarPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Avatar</Text>
              <TouchableOpacity onPress={() => setShowAvatarPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarOption,
                    editedData.avatar === avatar.id && styles.avatarOptionSelected,
                  ]}
                  onPress={() => selectAvatar(avatar.id)}
                >
                  <Image source={avatar.image} style={styles.avatarOptionImage} />
                  <Text style={styles.avatarOptionName}>{avatar.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  summaryAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  summaryInfo: {
    marginLeft: 16,
    flex: 1,
  },
  summaryName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.primary + '15',
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  editForm: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  profileInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  logoutText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: 8,
  },
  ordersContainer: {
    paddingHorizontal: 20,
  },
  orderGroup: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary + '08',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderGroupDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  orderGroupTotal: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderItemIcon: {
    marginRight: 12,
  },
  orderItemContent: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  orderItemDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  favoritesContainer: {
    paddingHorizontal: 20,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  favoriteItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  favoriteItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  favoriteItemDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  favoriteItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
    marginTop: 8,
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  avatarOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  avatarOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  avatarOptionName: {
    fontSize: 12,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
});

export default ProfileScreen;
