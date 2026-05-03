import { StyleSheet, Text, View } from "react-native";

type ContractCardProps = {
  customer: string;
  due: string;
  cycle: string;
};

export function ContractCard({ customer, due, cycle }: ContractCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.customer}>{customer}</Text>
      <Text style={styles.detail}>Ciclo: {cycle}</Text>
      <Text style={styles.status}>Proxima visita: {due}</Text>
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
  customer: {
    color: "#102033",
    fontSize: 18,
    fontWeight: "800",
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
