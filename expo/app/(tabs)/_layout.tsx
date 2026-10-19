import { Tabs } from "expo-router";
import { MapPin, BarChart3, Download } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.navy,
        tabBarInactiveTintColor: Colors.inkMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.paper,
          borderTopColor: Colors.line,
          ...(Platform.OS === "ios" ? {} : { elevation: 0 }),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Locations",
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="export"
        options={{
          title: "Export",
          tabBarIcon: ({ color, size }) => <Download color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
