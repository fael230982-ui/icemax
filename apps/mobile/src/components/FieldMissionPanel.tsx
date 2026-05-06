import { StyleSheet, Text, View } from "react-native";

type Mission = {
  serviceOrderId: string;
  customer: string;
  equipment: string;
  status: string;
  priority: string;
  routeEta: string;
  offlineRisk: string;
  nextAction: string;
};

type Item = {
  title: string;
  detail: string;
  state?: string;
  status?: string;
};

type FieldMissionPanelProps = {
  mission: Mission;
  steps: Item[];
  evidence: Item[];
  quickActions: Item[];
};

export function FieldMissionPanel({ mission, steps, evidence, quickActions }: FieldMissionPanelProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>OS {mission.serviceOrderId}</Text>
          <Text style={styles.customer}>{mission.customer}</Text>
          <Text style={styles.equipment}>{mission.equipment}</Text>
        </View>
        <View style={styles.statusBox}>
          <Text style={styles.status}>{mission.status}</Text>
          <Text style={styles.statusDetail}>{mission.priority} - {mission.routeEta}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Offline</Text>
          <Text style={styles.summaryValue}>{mission.offlineRisk}</Text>
        </View>
        <View style={styles.summaryItemWide}>
          <Text style={styles.summaryLabel}>Proxima acao</Text>
          <Text style={styles.summaryValue}>{mission.nextAction}</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {steps.map((step) => (
          <View style={styles.step} key={step.title}>
            <View style={[styles.stepDot, step.state === "next" ? styles.stepDotNext : null]} />
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDetail}>{step.detail}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {evidence.map((item) => (
          <View style={styles.card} key={item.title}>
            <Text style={styles.cardStatus}>{item.status}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDetail}>{item.detail}</Text>
          </View>
        ))}
      </View>

      <View style={styles.quickGrid}>
        {quickActions.map((action) => (
          <View style={styles.quickAction} key={action.title}>
            <Text style={styles.quickTitle}>{action.title}</Text>
            <Text style={styles.quickDetail}>{action.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE7F0",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  hero: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: "#0B7CEB",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  customer: {
    color: "#102033",
    fontSize: 21,
    fontWeight: "900",
  },
  equipment: {
    color: "#5D6B7A",
    lineHeight: 20,
  },
  statusBox: {
    minWidth: 108,
    alignSelf: "flex-start",
    borderColor: "#BBF7D0",
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "#F0FDF4",
  },
  status: {
    color: "#065F46",
    fontWeight: "900",
  },
  statusDetail: {
    color: "#0E9F6E",
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryItem: {
    width: 92,
    borderColor: "#EDF2F7",
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "#FBFDFF",
  },
  summaryItemWide: {
    flex: 1,
    borderColor: "#EDF2F7",
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "#FBFDFF",
  },
  summaryLabel: {
    color: "#5D6B7A",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: "#102033",
    marginTop: 5,
    fontWeight: "800",
    lineHeight: 19,
  },
  timeline: {
    gap: 9,
  },
  step: {
    borderColor: "#EDF2F7",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    backgroundColor: "#FBFDFF",
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#DCE7F0",
    marginBottom: 8,
  },
  stepDotNext: {
    backgroundColor: "#0B7CEB",
  },
  stepTitle: {
    color: "#102033",
    fontWeight: "900",
  },
  stepDetail: {
    color: "#5D6B7A",
    marginTop: 5,
    lineHeight: 19,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "48%",
    borderColor: "#EDF2F7",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  cardStatus: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  cardTitle: {
    color: "#102033",
    marginTop: 5,
    fontWeight: "900",
  },
  cardDetail: {
    color: "#5D6B7A",
    marginTop: 5,
    lineHeight: 18,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickAction: {
    width: "31%",
    minHeight: 82,
    borderColor: "#DCE7F0",
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "#F8FAFC",
  },
  quickTitle: {
    color: "#102033",
    fontWeight: "900",
  },
  quickDetail: {
    color: "#5D6B7A",
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
  },
});
