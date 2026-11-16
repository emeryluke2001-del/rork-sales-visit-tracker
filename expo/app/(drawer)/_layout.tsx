import { Drawer } from "expo-router/drawer";
import { Briefcase, Building2, MapPin } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors.navy,
        drawerInactiveTintColor: Colors.inkSoft,
        drawerActiveBackgroundColor: "rgba(17,115,66,0.08)",
        drawerLabelStyle: { fontSize: 15, fontWeight: "600" },
        drawerStyle: { backgroundColor: Colors.cream },
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
        name="jobs"
        options={{
          title: "Jobs",
          drawerIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="accounts"
        options={{
          title: "Accounts",
          drawerIcon: ({ color, size }) => <Building2 color={color} size={size} />,
        }}
      />
    </Drawer>
  );
}
