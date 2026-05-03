import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const orders = [
  { id: "#1048", customer: "ClimaSul Hotel", status: "Em atendimento", detail: "Sem refrigeracao" },
  { id: "#1050", customer: "Clinica Vida", status: "Em rota", detail: "Preventiva trimestral" },
  { id: "#1051", customer: "Mercado Avante", status: "Agendada", detail: "Dreno vazando" },
];

const tools = [
  { title: "Checklist", detail: "Itens obrigatorios por servico" },
  { title: "QR Code", detail: "Abrir ficha do equipamento" },
  { title: "Manuais", detail: "Consulta por marca e modelo" },
  { title: "Pecas", detail: "Baixa e solicitacao em campo" },
  { title: "WhatsApp", detail: "Enviar link ao cliente" },
  { title: "Check-in/out", detail: "Registrar chegada e saida" },
];

const contracts = [
  { customer: "Clinica Vida", due: "12/05/2026", cycle: "3 meses" },
  { customer: "ClimaSul Hotel", due: "20/05/2026", cycle: "4 meses" },
];

const quality = [
  { title: "KM", value: "36 km hoje" },
  { title: "Satisfacao", value: "Pesquisa apos OS" },
];

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ICEMAX Tecnico</Text>
          <Text style={styles.title}>Operacao de campo</Text>
        </View>

        <Text style={styles.sectionTitle}>Ordens de servico</Text>
        {orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.customer}>{order.customer}</Text>
            <Text style={styles.detail}>{order.detail}</Text>
            <Text style={styles.status}>{order.status}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Ferramentas</Text>
        <View style={styles.grid}>
          {tools.map((tool) => (
            <View key={tool.title} style={styles.tool}>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.detail}>{tool.detail}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Contratos proximos</Text>
        {contracts.map((contract) => (
          <View key={contract.customer} style={styles.card}>
            <Text style={styles.customer}>{contract.customer}</Text>
            <Text style={styles.detail}>Ciclo: {contract.cycle}</Text>
            <Text style={styles.status}>Proxima visita: {contract.due}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Qualidade</Text>
        <View style={styles.grid}>
          {quality.map((item) => (
            <View key={item.title} style={styles.tool}>
              <Text style={styles.toolTitle}>{item.title}</Text>
              <Text style={styles.detail}>{item.value}</Text>
            </View>
          ))}
        </View>
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
    fontSize: 30,
    fontWeight: "800",
    marginTop: 6,
  },
  sectionTitle: {
    color: "#102033",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 10,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tool: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE7F0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
  toolTitle: {
    color: "#102033",
    fontWeight: "800",
  },
});
