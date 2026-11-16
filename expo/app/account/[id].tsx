import React, { useMemo } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  Phone,
  Mail,
  MapPin,
  Navigation,
  Plus,
  DollarSign,
  Wallet,
  Briefcase,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLocationById } from "@/providers/LocationsProvider";
import { useJobs } from "@/providers/JobsProvider";
import { STAGE_META, formatMoney } from "@/types/job";

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const location = useLocationById(id);
  const { jobsByAccount } = useJobs();

  const jobs = useMemo(
    () => (id ? jobsByAccount[id] ?? [] : []),
    [jobsByAccount, id]
  );

  const totals = useMemo(() => {
    const paid = jobs.filter((j) => j.stage === "paid").reduce((a, j) => a + j.amount, 0);
    const owed = jobs.filter((j) => j.stage === "completed").reduce((a, j) => a + j.amount, 0);
    const open = jobs.filter((j) => j.stage === "quoted" || j.stage === "scheduled" || j.stage === "in_progress").reduce((a, j) => a + j.amount, 0);
    return { paid, owed, open };
  }, [jobs]);

  if (!location || !location.isAccount) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Account not found</Text>
      </View>
    );
  }

  const callPhone = () => {
    if (location.contactPhone) Linking.openURL(`tel:${location.contactPhone}`).catch(() => {});
  };
  const email = () => {
    if (location.contactEmail) Linking.openURL(`mailto:${location.contactEmail}`).catch(() => {});
  };
  const openMaps = () => {
    const q = encodeURIComponent(location.address || location.businessName);
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${q}`,
      android: `geo:0,0?q=${q}`,
      default: `https://maps.google.com/?q=${q}`,
    });
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: location.businessName,
          headerRight: () => (
            <Pressable
              onPress={() => router.push(`/location/edit/${location.id}`)}
              hitSlop={12}
              style={{ marginRight: 6 }}
            >
              <Text style={{ color: Colors.navy, fontWeight: "700", fontSize: 14 }}>Edit</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.cream }}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={[styles.badge, { backgroundColor: "#DCFCE7" }]}>
            <Text style={[styles.badgeText, { color: "#117342" }]}>Account</Text>
          </View>
          <Text style={styles.heroName}>{location.businessName}</Text>
          {location.contactName ? (
            <Text style={styles.heroContact}>{location.contactName}</Text>
          ) : null}
        </View>

        <View style={styles.moneyGrid}>
          <View style={[styles.moneyCard, { borderColor: "#117342" }]}>
            <DollarSign size={16} color="#117342" />
            <Text style={[styles.moneyValue, { color: "#117342" }]}>{formatMoney(totals.paid)}</Text>
            <Text style={styles.moneyLabel}>Total paid</Text>
          </View>
          <View style={[styles.moneyCard, { borderColor: Colors.danger }]}>
            <Wallet size={16} color={Colors.danger} />
            <Text style={[styles.moneyValue, { color: Colors.danger }]}>{formatMoney(totals.owed)}</Text>
            <Text style={styles.moneyLabel}>Still owed</Text>
          </View>
        </View>

        {(location.address || location.contactPhone || location.contactEmail) && (
          <View style={styles.card}>
            {location.address ? (
              <Pressable style={styles.detailRow} onPress={openMaps}>
                <MapPin size={16} color={Colors.inkSoft} />
                <Text style={styles.detailText}>{location.address}</Text>
              </Pressable>
            ) : null}
            {location.contactPhone ? (
              <Pressable style={styles.detailRow} onPress={callPhone}>
                <Phone size={16} color={Colors.inkSoft} />
                <Text style={styles.detailText}>{location.contactPhone}</Text>
              </Pressable>
            ) : null}
            {location.contactEmail ? (
              <Pressable style={styles.detailRow} onPress={email}>
                <Mail size={16} color={Colors.inkSoft} />
                <Text style={styles.detailText}>{location.contactEmail}</Text>
              </Pressable>
            ) : null}
            {location.notes ? (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.cardLabel}>NOTES</Text>
                <Text style={styles.notesText}>{location.notes}</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.jobHeader}>
            <Text style={styles.cardLabel}>
              JOBS · {jobs.length}
              {totals.open > 0 ? ` · ${formatMoney(totals.open)} in pipeline` : ""}
            </Text>
            <Pressable
              onPress={() => router.push(`/job/new?accountId=${location.id}`)}
              style={styles.addJobBtn}
              testID="add-account-job"
            >
              <Plus size={14} color={Colors.cream} strokeWidth={2.5} />
              <Text style={styles.addJobText}>Add job</Text>
            </Pressable>
          </View>
          {jobs.length === 0 ? (
            <View style={styles.emptyJobs}>
              <Briefcase size={18} color={Colors.inkMuted} />
              <Text style={styles.emptyJobsText}>
                No jobs yet for this account.
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 4 }}>
              {jobs.map((j) => {
                const sm = STAGE_META[j.stage];
                return (
                  <Pressable
                    key={j.id}
                    onPress={() => router.push(`/job/${j.id}`)}
                    style={styles.jobRow}
                    testID={`account-job-${j.id}`}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.jobTitle} numberOfLines={1}>
                        {j.title}
                      </Text>
                      <View style={[styles.stageMini, { backgroundColor: sm.bg }]}>
                        <Text style={[styles.stageMiniText, { color: sm.color }]}>
                          {sm.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.jobAmount}>{formatMoney(j.amount)}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <Pressable onPress={openMaps} style={styles.dirBtn}>
          <Navigation size={16} color={Colors.navy} />
          <Text style={styles.dirText}>Get directions</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60, gap: 14 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.cream },
  notFoundText: { color: Colors.inkSoft },
  hero: {
    backgroundColor: Colors.paper,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  heroName: { fontSize: 22, fontWeight: "800", color: Colors.ink, letterSpacing: -0.3 },
  heroContact: { fontSize: 14, color: Colors.inkSoft, marginTop: 2 },
  moneyGrid: { flexDirection: "row", gap: 12 },
  moneyCard: {
    flex: 1,
    backgroundColor: Colors.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    gap: 4,
  },
  moneyValue: { fontSize: 20, fontWeight: "800" },
  moneyLabel: { fontSize: 12, color: Colors.inkSoft, fontWeight: "600" },
  card: {
    backgroundColor: Colors.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.inkMuted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  detailText: { flex: 1, fontSize: 14, color: Colors.ink },
  notesText: { fontSize: 14, color: Colors.ink, lineHeight: 21 },
  jobHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 8,
  },
  addJobBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#117342",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addJobText: { color: Colors.cream, fontSize: 12, fontWeight: "700" },
  emptyJobs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  emptyJobsText: { fontSize: 13, color: Colors.inkMuted },
  jobRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  jobTitle: { fontSize: 14, fontWeight: "600", color: Colors.ink },
  stageMini: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  stageMiniText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  jobAmount: { fontSize: 14, fontWeight: "700", color: "#117342" },
  dirBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  dirText: { color: Colors.navy, fontSize: 14, fontWeight: "700" },
});
