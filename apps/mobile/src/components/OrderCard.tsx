import { StyleSheet, Text, View } from "react-native";

type OrderCardProps = {
  id: string;
  customer: string;
  status: string;
  detail: string;
  priority: string;
};

export function OrderCard({ id, customer, status, detail, priority }: OrderCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.orderId}>{id}</Text>
        <Text style={styles.priority}>{priority}</Text>
      </View>
      <Text style={styles.customer}>{customer}</Text>
      <Text style={styles.detail}>{detail}</Text>
      <Text style={styles.status}>{status}</Text>
    </View>
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
});
