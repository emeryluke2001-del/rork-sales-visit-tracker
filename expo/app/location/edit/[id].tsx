import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import LocationForm from "@/components/LocationForm";
import ScreenBackground from "@/components/ScreenBackground";
import { useLocationById, useLocations } from "@/providers/LocationsProvider";
import { useTheme } from "@/providers/ThemeProvider";
import type { ThemeColors } from "@/constants/theme";

export default function EditLocationScreen() {
  const { colors: Colors } = useTheme();
  const styles = makeStyles(Colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const location = useLocationById(id);
  const { updateLocation } = useLocations();

  if (!location) {
    return (
      <View style={styles.empty}>
        <ScreenBackground />
        <Text style={styles.emptyText}>Location not found</Text>
      </View>
    );
  }

  return (
    <LocationForm
      submitLabel="Save Changes"
      initial={location}
      onSubmit={(value) => {
        updateLocation(location.id, value);
        router.back();
      }}
    />
  );
}

const makeStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
    empty: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.cream },
    emptyText: { color: Colors.inkSoft },
  });
