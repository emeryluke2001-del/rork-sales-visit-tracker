import { Drawer } from "expo-router/drawer";
import { Briefcase, Building2, MapPin, Settings } from "lucide-react-native";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";

export default function DrawerLayout() {
  const { colors: Colors } = useTheme();
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors.navy,
        drawerInactiveTintColor: Colors.inkSoft,
        drawerActiveBackgroundColor: "rgba(17,115,66,0.08)",
        drawerLabelStyle: { fontSize: 15, fontWeight: "600" },
        drawerStyle: {
          backgroundColor: Colors.canvasGradient ? "#F6FCF8" : Colors.cream,
        },
        overlayColor: "rgba(8,19,39,0.45)",
      }}
    >
      <Drawer.Screen
        name="sales"
        options={{
          title: "Sales",
          drawerIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="jobs/index"
        options={{
          title: "Jobs",
          drawerIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="accounts/index"
        options={{
          title: "Accounts",
          drawerIcon: ({ color, size }) => <Building2 color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          drawerIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Drawer>
  );
}
