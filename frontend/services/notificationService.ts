import { PermissionsAndroid, Platform } from "react-native";
import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import apiClient from "./httpClient";

export type BackendNotificationType =
  | "NewMessage"
  | "MessageRead"
  | "PostLiked"
  | "PostCommented"
  | "NewFollower"
  | "Mentioned"
  | "Tagged"
  | string;

export interface BackendNotificationDto {
  id: string;
  actorId: string;
  entityId: string;
  type: BackendNotificationType;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface PagedNotificationResult<T> {
  items: T[];
  Items?: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
}

export interface NotificationSettingDto {
  isEnabled: boolean;
}

export type Notification = BackendNotificationDto & {
  message: string;
};

type DevicePlatform = "Android" | "iOS";

function toNotification(dto: BackendNotificationDto): Notification {
  return {
    ...dto,
    message: dto.content,
  };
}

function getDevicePlatform(): DevicePlatform {
  return Platform.OS === "ios" ? "iOS" : "Android";
}

function isPermissionGranted(status: number): boolean {
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  );
}

async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;

  const version =
    typeof Platform.Version === "number"
      ? Platform.Version
      : Number.parseInt(String(Platform.Version), 10);

  if (!Number.isFinite(version) || version < 33) return true;

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function getNotifications(
  page = 1,
  pageSize = 20,
): Promise<Notification[]> {
  const { data } = await apiClient.get<
    PagedNotificationResult<BackendNotificationDto>
  >("/notification", {
    params: { page, pageSize },
  });

  return (data.items ?? data.Items ?? [])
    .map(toNotification)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  await apiClient.put(`/notification/${notificationId}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.put("/notification/read-all");
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await apiClient.get<{ unreadCount?: number; UnreadCount?: number }>(
    "/notification/unread-count",
  );
  return data.unreadCount ?? data.UnreadCount ?? 0;
}

export async function getNotificationSettings(): Promise<NotificationSettingDto> {
  const { data } = await apiClient.get<
    NotificationSettingDto & { IsEnabled?: boolean }
  >(
    "/notifications/settings",
  );
  return { isEnabled: data.isEnabled ?? data.IsEnabled ?? false };
}

export async function updateNotificationSettings(
  isEnabled: boolean,
): Promise<void> {
  await apiClient.put("/notifications/settings", { isEnabled });
}

export async function registerDeviceToken(token: string): Promise<void> {
  await apiClient.post("/notification/device/register", {
    token,
    platform: getDevicePlatform(),
  });
}

export async function registerDeviceForPushNotifications(): Promise<boolean> {
  try {
    const settings = await getNotificationSettings();
    if (!settings.isEnabled) return false;

    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }

    if (!(await requestAndroidNotificationPermission())) return false;

    if (Platform.OS === "ios") {
      const status = await messaging().requestPermission();
      if (!isPermissionGranted(status)) return false;
    }

    const token = await messaging().getToken();
    if (!token) return false;

    await registerDeviceToken(token);
    return true;
  } catch (error) {
    console.warn("[Notifications] Failed to register device token", error);
    return false;
  }
}

export function subscribeToPushTokenRefresh(): () => void {
  return messaging().onTokenRefresh((token) => {
    void (async () => {
      const settings = await getNotificationSettings();
      if (!settings.isEnabled) return;
      await registerDeviceToken(token);
    })().catch((error) => {
      console.warn("[Notifications] Failed to register refreshed token", error);
    });
  });
}

export function subscribeToForegroundNotifications(
  handler: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): () => void {
  return messaging().onMessage(async (message) => {
    handler(message);
  });
}
