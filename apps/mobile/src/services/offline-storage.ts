import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OfflineAction } from "./api";

const offlineQueueKey = "@icemax/mobile/offline-queue";
const activeOrderKey = "@icemax/mobile/active-order-id";
const retentionHoursByPriority = {
  critical: 168,
  high: 96,
  normal: 72,
};

export async function loadOfflineQueue() {
  const snapshot = await loadOfflineQueueSnapshot();
  return snapshot.actions;
}

export async function loadOfflineQueueSnapshot() {
  const raw = await AsyncStorage.getItem(offlineQueueKey);

  if (!raw) {
    return { actions: [] as OfflineAction[], discarded: 0 };
  }

  try {
    const parsed = JSON.parse(raw);
    const actions = Array.isArray(parsed) ? parsed as OfflineAction[] : [];
    const retainedActions = pruneExpiredOfflineActions(actions);

    return {
      actions: retainedActions,
      discarded: actions.length - retainedActions.length,
    };
  } catch {
    return { actions: [] as OfflineAction[], discarded: 0 };
  }
}

export async function saveOfflineQueue(actions: OfflineAction[]) {
  await AsyncStorage.setItem(offlineQueueKey, JSON.stringify(pruneExpiredOfflineActions(actions)));
}

export async function clearOfflineQueue() {
  await AsyncStorage.removeItem(offlineQueueKey);
}

export async function loadActiveOrderId(allowedOrderIds: string[], fallbackOrderId: string) {
  const raw = await AsyncStorage.getItem(activeOrderKey);

  if (raw && allowedOrderIds.includes(raw)) {
    return raw;
  }

  return fallbackOrderId;
}

export async function saveActiveOrderId(orderId: string) {
  await AsyncStorage.setItem(activeOrderKey, orderId);
}

export function getOfflineActionRetentionHours(action: OfflineAction) {
  return retentionHoursByPriority[action.priority ?? "normal"];
}

export function isOfflineActionExpired(action: OfflineAction, now = new Date()) {
  const createdAt = Date.parse(action.createdAt);

  if (Number.isNaN(createdAt)) {
    return false;
  }

  const ageInHours = (now.getTime() - createdAt) / 1000 / 60 / 60;
  return ageInHours > getOfflineActionRetentionHours(action);
}

export function pruneExpiredOfflineActions(actions: OfflineAction[], now = new Date()) {
  return actions.filter((action) => !isOfflineActionExpired(action, now));
}
