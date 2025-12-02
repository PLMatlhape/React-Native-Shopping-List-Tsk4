// Profile Screen for React Native
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
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
import { useAuth } from '../context/AuthContext';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, updateUser, signOut } = useAuth();
  
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

  // Get user avatar
  const userAvatar = user?.avatar
    ? AVATAR_OPTIONS.find((a: { id: string; name: string; image: any }) => a.id === user.avatar)?.image || DEFAULT_AVATAR
    : DEFAULT_AVATAR;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser(editedData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  const selectAvatar = (avatarId: string) => {
    setEditedData(prev => ({ ...prev, avatar: avatarId }));
    setShowAvatarPicker(false);
  };

  const menuItems = [
    { icon: 'heart-outline', label: 'Favorites', onPress: () => {} },
    { icon: 'receipt-outline', label: 'Order History', onPress: () => {} },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
    { icon: 'information-circle-outline', label: 'About', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
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
        </View>

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
                    onChangeText={(text) => setEditedData(prev => ({ ...prev, name: text }))}
                    placeholder="First Name"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={styles.inputLabel}>Surname</Text>
                  <TextInput
                    style={styles.input}
                    value={editedData.surname}
                    onChangeText={(text) => setEditedData(prev => ({ ...prev, surname: text }))}
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
                  onChangeText={(text) => setEditedData(prev => ({ ...prev, email: text }))}
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
                  onChangeText={(text) => setEditedData(prev => ({ ...prev, cellNumber: text }))}
                  placeholder="Cell Number"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.name} {user?.surname}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.profilePhone}>{user?.cellNumber}</Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        {!isEditing && (
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as any} size={24} color={COLORS.text} />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
              {AVATAR_OPTIONS.map((avatar: { id: string; name: string; image: any }) => (
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
  profileCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  editForm: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
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
    backgroundColor: COLORS.primaryLight + '20',
  },
  avatarOptionImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  avatarOptionName: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default ProfileScreen;
