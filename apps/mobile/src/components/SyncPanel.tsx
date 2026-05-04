import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { OfflineAction } from "../services/api";

type SyncPanelProps = {
  pendingActions: OfflineAction[];
  status: string;
  onAddCheckIn: () => void;
  onAddExecutionPack: () => void;
  onSync: () => void;
};

export function SyncPanel({ pendingActions, status, onAddCheckIn, onAddExecutionPack, onSync }: SyncPanelProps) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>Sincronizacao offline</Text>
        <Text style={styles.status}>{status}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={onAddCheckIn}>
          <Text style={styles.buttonText}>Check-in offline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddExecutionPack}>
          <Text style={styles.buttonText}>Pacote OS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onSync}>
          <Text style={[styles.buttonText, styles.secondaryText]}>Sincronizar</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.count}>{pendingActions.length} acoes pendentes</Text>
      {pendingActions.map((action) => (
        <Text key={action.id} style={styles.pending}>{action.label}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderColor: "#DCE7F0",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  title: {
    color: "#102033",
    fontSize: 16,
    fontWeight: "800",
  },
  status: {
    color: "#5D6B7A",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  button: {
    minHeight: 40,
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#0B7CEB",
    paddingHorizontal: 14,
  },
  secondary: {
    borderColor: "#DCE7F0",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  secondaryText: {
    color: "#102033",
  },
  pending: {
    color: "#102033",
    fontWeight: "700",
  },
  count: {
    color: "#0B7CEB",
    fontWeight: "800",
  },
});
