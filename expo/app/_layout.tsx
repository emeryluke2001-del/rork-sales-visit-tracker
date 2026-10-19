import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LocationsProvider } from "@/providers/LocationsProvider";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.cream },
        headerTitleStyle: { color: Colors.ink, fontWeight: "700" },
        headerTintColor: Colors.navy,
        contentStyle: { backgroundColor: Colors.cream },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy Policy" }} />
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
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <LocationsProvider>
            <StatusBar style="dark" />
            <RootLayoutNav />
          </LocationsProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
