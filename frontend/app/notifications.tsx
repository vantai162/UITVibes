import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import type { Notification } from '../services/notificationService';
import { AppColors } from '../constants/theme';
import { formatDistanceToNow } from '../utils/time';
import { CompactHeader } from '../components/StaticPremiumHeader';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, refreshNotifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useApp();

  useEffect(() => {
    refreshNotifications();
  }, []);

  const getNotificationIcon = (type: string): { name: string; color: string } => {
    switch (type) {
      case 'NewFollower':
        return { name: 'user-plus', color: AppColors.primary };
      case 'PostLiked':
        return { name: 'heart', color: '#e74c3c' };
      case 'PostCommented':
        return { name: 'message-circle', color: '#3498db' };
      case 'Mentioned':
      case 'Tagged':
        return { name: 'at-sign', color: '#9b59b6' };
      case 'NewMessage':
        return { name: 'message-square', color: AppColors.primary };
      case 'MessageRead':
        return { name: 'check-circle', color: '#2ecc71' };
      default:
        return { name: 'bell', color: AppColors.textMuted };
    }
  };

  const handleNotificationPress = async (notif: Notification) => {
    if (!notif.isRead) {
      await markNotificationRead(notif.id);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${icon.color}18` }]}>
          <Feather name={icon.name as any} size={20} color={icon.color} />
        </View>

        <View style={styles.content}>
          <Text style={styles.notifText} numberOfLines={3}>
            {item.content || item.message}
          </Text>
          <Text style={styles.time}>
            {formatDistanceToNow(new Date(item.createdAt))}
          </Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <CompactHeader
        title="Notifications"
        showBack
        onBack={() => router.back()}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={markAllNotificationsRead}
              activeOpacity={0.7}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="bell" size={48} color={AppColors.textMuted} />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>
              When someone interacts with you, you'll see it here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  list: {
    paddingBottom: 100,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
    backgroundColor: AppColors.surface,
  },
  notifItemUnread: {
    backgroundColor: `${AppColors.primary}06`,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  notifText: {
    fontSize: 14,
    lineHeight: 20,
    color: AppColors.text,
  },
  time: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.primary,
    marginLeft: 6,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AppColors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
