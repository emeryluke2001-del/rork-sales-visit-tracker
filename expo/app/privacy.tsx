import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { Shield } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function PrivacyPolicyScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Privacy Policy" }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        testID="privacy-policy-scroll"
      >
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Shield color={Colors.navy} size={28} />
          </View>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.updated}>Last updated: April 23, 2026</Text>
        </View>

        <Section title="Overview">
          Sales Manager (&quot;we&quot;, &quot;the app&quot;) helps salespeople
          track business locations, contacts, visits, and notes. We respect
          your privacy and are committed to protecting it.
        </Section>

        <Section title="Information We Collect">
          All data you enter — including location names, addresses, contact
          details, notes, and visit history — is stored locally on your device.
          We do not collect, transmit, or sell your personal information.
        </Section>

        <Section title="Google Sheets Export">
          When you choose to export your data to Google Sheets, the data is
          sent directly from your device to your own Google account. We do not
          store or access this data on our servers.
        </Section>

        <Section title="Permissions">
          The app may request access to your location and contacts to improve
          your workflow. These permissions are optional and used only on your
          device.
        </Section>

        <Section title="Data Security">
          Your data is stored securely on your device. We recommend using
          device-level security (passcode, Face ID, Touch ID) to protect your
          information.
        </Section>

        <Section title="Children's Privacy">
          This app is not intended for children under 13. We do not knowingly
          collect information from children.
        </Section>

        <Section title="Changes to This Policy">
          We may update this policy from time to time. Changes will be posted
          in the app with an updated date.
        </Section>

        <Section title="Contact">
          If you have any questions about this Privacy Policy, please contact
          the app developer through your app store listing.
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Sales Manager, you agree to this Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 24,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.paper,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  updated: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  section: {
    backgroundColor: Colors.paper,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.navy,
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.inkSoft,
  },
  footer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  footerText: {
    fontSize: 12,
    color: Colors.inkMuted,
    textAlign: "center",
  },
});
