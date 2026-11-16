import React, { useMemo, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Building2, MapPin, Phone } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLocations } from "@/providers/LocationsProvider";
import { useJobs } from "@/providers/JobsProvider";
import { formatMoney } from "@/types/job";
import * as Haptics from "expo-haptics";
import DrawerMenuButton from "@/components/DrawerMenuButton";

export default function AccountsScreen() {
  const { locations } = useLocations();
  const { jobsByAccount } = useJobs();
  const [query, setQuery] = useState<string>("");

  const accounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return locations
      .filter((l) => l.isAccount)
      .filter((l) => !q || l.businessName.toLowerCase().includes(q) || l.contactName.toLowerCase().includes(q));
  }, [locations, query]);

  const summary = useMemo(() => {
    let paid = 0;
    let owed = 0;
    for (const l of accounts) {
      for (const j of jobsByAccount[l.id] ?? []) {
        if (j.stage === "paid") paid += j.amount;
        if (j.stage === "completed") owed += j.amount;
      }
    }
    return { paid, owed };
  }, [accounts, jobsByAccount]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
          <DrawerMenuButton />
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Accounts</Text>
            <Text style={styles.subhello}>
              {accounts.length} account{accounts.length === 1 ? "" : "s"} · {formatMoney(summary.paid)} paid
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("/location/new")}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
          testID="add-account-button"
        >
          <PlusIcon />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search accounts"
          placeholderTextColor={Colors.inkMuted}
          style={styles.searchInput}
          testID="account-search-input"
        />
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const accJobs = jobsByAccount[item.id] ?? [];
          const paid = accJobs.filter((j) => j.stage === "paid").reduce((a, j) => a + j.amount, 0);
          const owed = accJobs.filter((j) => j.stage === "completed").reduce((a, j) => a + j.amount, 0);
          return (
            <Pressable
              onPress={() => router.push(`/account/${item.id}`)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              testID={`account-card-${item.id}`}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.businessName}
                  </Text>
                  {item.contactName ? (
                    <Text style={styles.cardSub} numberOfLines={1}>
                      {item.contactName}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.totals}>
                  {paid > 0 ? (
                    <Text style={styles.paidText}>{formatMoney(paid)} paid</Text>
                  ) : null}
                  {owed > 0 ? (
                    <Text style={styles.owedText}>{formatMoney(owed)} owed</Text>
                  ) : null}
                  {paid === 0 && owed === 0 ? (
                    <Text style={styles.noJobs}>No jobs yet</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.footerRow}>
                {item.address ? (
                  <View style={styles.metaRow}>
                    <MapPin size={12} color={Colors.inkMuted} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {item.address}
                    </Text>
                  </View>
                ) : null}
                {item.contactPhone ? (
                  <View style={styles.metaRow}>
                    <Phone size={12} color={Colors.inkMuted} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {item.contactPhone}
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.jobCount}>
                  {accJobs.length} job{accJobs.length === 1 ? "" : "s"}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Building2 size={28} color={Colors.navy} />
            </View>
            <Text style={styles.emptyTitle}>
              {locations.some((l) => l.isAccount) ? "Nothing matches" : "No accounts yet"}
            </Text>
            <Text style={styles.emptyText}>
              {locations.some((l) => l.isAccount)
                ? "Try a different search."
                : "Open a location and tap \"Convert to Account\" to turn a business into a customer."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function PlusIcon() {
  return <Text style={{ color: Colors.cream, fontSize: 24, fontWeight: "700", lineHeight: 28 }}>+</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 12,
    paddingRight: 20,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  hello: { fontSize: 24, fontWeight: "800", color: Colors.ink, letterSpacing: -0.5 },
  subhello: { fontSize: 12, color: Colors.inkSoft, marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.navy,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  searchWrap: {
    marginHorizontal: 20,
    marginVertical: 8,
    backgroundColor: Colors.paper,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.line,
  },
  searchIcon: { fontSize: 16, color: Colors.inkMuted, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.ink,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {}),
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  card: {
    backgroundColor: Colors.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.ink },
  cardSub: { fontSize: 13, color: Colors.inkSoft, marginTop: 2 },
  totals: { alignItems: "flex-end", gap: 4 },
  paidText: { fontSize: 12, fontWeight: "800", color: "#117342" },
  owedText: { fontSize: 12, fontWeight: "800", color: Colors.danger },
  noJobs: { fontSize: 12, color: Colors.inkMuted, fontWeight: "600" },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 },
  metaText: { fontSize: 12, color: Colors.inkMuted, flexShrink: 1 },
  jobCount: { fontSize: 12, color: Colors.inkSoft, fontWeight: "700", marginLeft: "auto" },
  empty: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: Colors.ink, marginBottom: 6 },
  emptyText: { fontSize: 14, color: Colors.inkSoft, textAlign: "center", lineHeight: 20 },
});
