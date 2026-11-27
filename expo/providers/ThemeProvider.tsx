import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { getTheme, type ThemeColors, type ThemeId } from "@/constants/theme";

const STORAGE_KEY = "rork.theme.v1";

export const [ThemeProvider, useTheme] = createContextHook((): {
  themeId: ThemeId;
  colors: ThemeColors;
  setThemeId: (id: ThemeId) => void;
} => {
  const [themeId, setThemeIdState] = useState<ThemeId>("original");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw === "midnight" || raw === "original") setThemeIdState(raw);
      })
      .catch(() => {});
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    AsyncStorage.setItem(STORAGE_KEY, id).catch(() => {});
  }, []);

  return { themeId, colors: getTheme(themeId), setThemeId };
});
