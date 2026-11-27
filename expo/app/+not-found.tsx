import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import ScreenBackground from "@/components/ScreenBackground";
import type { ThemeColors } from "@/constants/theme";

export default function NotFoundScreen() {
  const { colors: Colors } = useTheme();
  const styles = makeStyles(Colors);
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <ScreenBackground />
        <Text style={styles.title}>This page doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go back home</Text>
        </Link>
      </View>
    </>
  );
}

const makeStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      backgroundColor: Colors.cream,
    },
    title: { fontSize: 18, fontWeight: "700", color: Colors.ink },
    link: { marginTop: 15, paddingVertical: 15 },
    linkText: { fontSize: 14, color: Colors.navy, fontWeight: "600" },
  });
