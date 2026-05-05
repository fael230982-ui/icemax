import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OfflineAction } from "./api";

const offlineQueueKey = "@icemax/mobile/offline-queue";

export async function loadOfflineQueue() {
  const raw = await AsyncStorage.getItem(offlineQueueKey);

  if (!raw) {
    return [] as OfflineAction[];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as OfflineAction[] : [];
  } catch {
    return [];
  }
}

export async function saveOfflineQueue(actions: OfflineAction[]) {
  await AsyncStorage.setItem(offlineQueueKey, JSON.stringify(actions));
}

export async function clearOfflineQueue() {
  await AsyncStorage.removeItem(offlineQueueKey);
}
