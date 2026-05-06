import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type OrderCardProps = {
  id: string;
  customer: string;
  status: string;
  detail: string;
  priority: string;
  active?: boolean;
  onPress?: () => void;
};

export function OrderCard({ id, customer, status, detail, priority, active, onPress }: OrderCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.78} onPress={onPress} style={[styles.card, active ? styles.activeCard : null]}>
      <View style={styles.row}>
        <Text style={styles.orderId}>{id}</Text>
        <Text style={[styles.priority, active ? styles.activePriority : null]}>{priority}</Text>
      </View>
      <Text style={styles.customer}>{customer}</Text>
      <Text style={styles.detail}>{detail}</Text>
      <Text style={styles.status}>{status}</Text>
      {active ? <Text style={styles.activeLabel}>Missao ativa</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE7F0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  activeCard: {
    borderColor: "#0B7CEB",
    backgroundColor: "#F0F8FF",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  orderId: {
    color: "#5D6B7A",
    fontWeight: "700",
  },
  priority: {
    color: "#0B7CEB",
    fontWeight: "800",
  },
  activePriority: {
    color: "#075985",
  },
  customer: {
    color: "#102033",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 5,
  },
  detail: {
    color: "#5D6B7A",
    marginTop: 5,
  },
  status: {
    color: "#0E9F6E",
    marginTop: 7,
    fontWeight: "700",
  },
  activeLabel: {
    alignSelf: "flex-start",
    marginTop: 10,
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: "#075985",
    backgroundColor: "#E0F2FE",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
