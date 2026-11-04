import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "@/theme";

interface TiltCard3DProps {
  children: React.ReactNode;
  isDark?: boolean;
  style?: ViewStyle;
  shakeTrigger?: boolean | string | null;
}

/** Thẻ hiệu ứng kính nổi 3D hiện đại, chuẩn hóa theo theme tokens. */
export function TiltCard3D({
  children,
  isDark: propIsDark,
  style,
}: TiltCard3DProps) {
  const theme = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme.isDark;
  const { colors, radius } = theme;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadow,
            borderRadius: radius["3xl"] + 6,
          },
          style,
        ]}>
        <View
          pointerEvents="none"
          style={[
            styles.topBevel,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.18)"
                : "rgba(255, 255, 255, 0.8)",
            },
          ]}
        />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  card: {
    width: "100%",
    borderWidth: 1.5,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  topBevel: {
    position: "absolute",
    top: 0,
    left: 24,
    right: 24,
    height: 1.5,
    borderRadius: 1,
  },
});
