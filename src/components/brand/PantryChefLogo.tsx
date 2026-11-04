import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/theme";

interface PantryChefLogoProps {
  size?: number;
  withBackground?: boolean;
}

export function PantryChefLogo({
  size = 88,
  withBackground = true,
}: PantryChefLogoProps) {
  const { colors, radius, shadows } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius["2xl"],
          backgroundColor: withBackground ? colors.primary : "transparent",
        },
        withBackground ? shadows.sm : null,
      ]}>
      <MaterialCommunityIcons
        name="chef-hat"
        size={Math.round(size * 0.6)}
        color={withBackground ? colors.textOnPrimary : colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
