import { StyleSheet, Text, View } from "react-native";

type InfoCardProps = {
  title: string;
  detail: string;
};

export function InfoCard({ title, detail }: InfoCardProps) {
  return (
    <View style={styles.tool}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tool: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE7F0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
  title: {
    color: "#102033",
    fontWeight: "800",
  },
  detail: {
    color: "#5D6B7A",
    marginTop: 5,
  },
});
