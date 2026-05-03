import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { ContractCard } from "./src/components/ContractCard";
import { InfoCard } from "./src/components/InfoCard";
import { OrderCard } from "./src/components/OrderCard";
import { Section } from "./src/components/Section";
import { contracts, executionSteps, orders, quality, tools } from "./src/data/dashboard";

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ICEMAX Tecnico</Text>
          <Text style={styles.title}>Operacao de campo</Text>
        </View>

        <Section title="Ordens de servico">
          {orders.map((order) => (
            <OrderCard key={order.id} {...order} />
          ))}
        </Section>

        <Section title="Ferramentas">
          <View style={styles.grid}>
            {tools.map((tool) => (
              <InfoCard key={tool.title} title={tool.title} detail={tool.detail} />
            ))}
          </View>
        </Section>

        <Section title="Execucao da OS">
          <View style={styles.grid}>
            {executionSteps.map((step) => (
              <InfoCard key={step.title} title={step.title} detail={step.detail} />
            ))}
          </View>
        </Section>

        <Section title="Contratos proximos">
          {contracts.map((contract) => (
            <ContractCard key={contract.customer} {...contract} />
          ))}
        </Section>

        <Section title="Qualidade">
          <View style={styles.grid}>
            {quality.map((item) => (
              <InfoCard key={item.title} title={item.title} detail={item.value} />
            ))}
          </View>
        </Section>
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
    gap: 18,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
