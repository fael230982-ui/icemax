import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const orders = [
  { id: "#1048", customer: "ClimaSul Hotel", status: "Em atendimento" },
  { id: "#1050", customer: "Clinica Vida", status: "Em rota" },
  { id: "#1051", customer: "Mercado Avante", status: "Agendada" },
];

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ICEMAX Tecnico</Text>
          <Text style={styles.title}>Ordens de servico do dia</Text>
        </View>

        {orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.customer}>{order.customer}</Text>
            <Text style={styles.status}>{order.status}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F8FB",
  },
  container: {
    padding: 20,
    gap: 12,
  },
  header: {
    paddingVertical: 18,
  },
  eyebrow: {
    color: "#0B7CEB",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: "#102033",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE7F0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  orderId: {
    color: "#5D6B7A",
    fontWeight: "700",
  },
  customer: {
    color: "#102033",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },
  status: {
    color: "#0E9F6E",
    marginTop: 6,
    fontWeight: "700",
  },
});
