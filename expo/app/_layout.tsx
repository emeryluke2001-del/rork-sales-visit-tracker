import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { LocationsProvider } from "@/providers/LocationsProvider";
import { JobsProvider } from "@/providers/JobsProvider";
import { DayNotesProvider } from "@/providers/DayNotesProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { colors: Colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        pointerEvents="none"
        colors={Colors.canvasGradient ?? ([Colors.cream, Colors.cream] as const)}
        style={StyleSheet.absoluteFill}
      />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: Colors.cream },
          headerTitleStyle: { color: Colors.ink, fontWeight: "700" },
          headerTintColor: Colors.navy,
          contentStyle: {
            backgroundColor: Colors.canvasGradient ? "transparent" : Colors.cream,
          },
        }}
      >
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen
        name="location/[id]"
        options={{ title: "Location", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="location/new"
        options={{
          title: "New Location",
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
      <Stack.Screen
        name="location/edit/[id]"
        options={{
          title: "Edit Location",
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
      <Stack.Screen
        name="visit/new"
        options={{
          title: "Log Visit",
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
      <Stack.Screen
        name="account/[id]"
        options={{ title: "Account", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="job/[id]"
        options={{ title: "Job", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="job/new"
        options={{
          title: "New Job",
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
      <Stack.Screen
        name="job/edit/[id]"
        options={{
          title: "Edit Job",
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
    </Stack>
    </View>
  );
}

function ThemeStatusBar() {
  const { themeId } = useTheme();
  return <StatusBar style={themeId === "original" ? "dark" : "light"} />;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <LocationsProvider>
              <JobsProvider>
                <DayNotesProvider>
                  <ThemeStatusBar />
                  <RootLayoutNav />
                </DayNotesProvider>
              </JobsProvider>
            </LocationsProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
