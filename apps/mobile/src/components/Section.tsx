import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: "#102033",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 10,
  },
});
