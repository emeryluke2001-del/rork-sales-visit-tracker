import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Menu } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { useTheme } from "@/providers/ThemeProvider";

export default function DrawerMenuButton({ color }: { color?: string }) {
  const navigation = useNavigation();
  const { colors: Colors } = useTheme();
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      hitSlop={12}
      style={styles.btn}
      testID="drawer-menu-button"
    >
      <Menu size={24} color={color ?? Colors.navy} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
});
