import api from "./axios";

export interface UserNotification {
  id: string;
  collectiviteId: string;
  type: string;
  titre: string;
  message: string;
  lien?: string;
  creeLe: string;
  luLe?: string | null;
  lue: boolean;
}

export interface NotificationCenter {
  notifications: UserNotification[];
  nonLues: number;
}

export async function listNotifications(limit = 50): Promise<NotificationCenter> {
  const response = await api.get<NotificationCenter>("/notifications", { params: { limite: limit } });
  return response.data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/lue`);
}

export async function markAllNotificationsRead(): Promise<number> {
  const response = await api.patch<number>("/notifications/lire-tout");
  return response.data;
}