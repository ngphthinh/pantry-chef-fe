import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";

interface TactileButton3DProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap | undefined;
}

/** Nút tĩnh, chỉ đổi style khi nhấn (không animation). */
export function TactileButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  iconName = undefined,
}: TactileButton3DProps) {
  const inactive = disabled || loading;

  return (
    <Pressable onPress={onPress} disabled={inactive} style={styles.wrapper}>
      {({ pressed }) => (
        <>
          <View style={styles.bevelBase} />

          <View
            style={[
              styles.buttonSurface,
              {
                transform: [{ translateY: pressed ? 3 : 0 }],
                opacity: inactive ? 0.75 : 1,
              },
            ]}>
            <View style={styles.topRim} />

            {loading ? (
              <View style={styles.row}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <AppText style={styles.loadingText}>Đang xác thực...</AppText>
              </View>
            ) : (
              <View style={styles.row}>
                <AppText style={styles.buttonText}>{title}</AppText>
                {iconName ? (
                  <Ionicons
                    name={iconName}
                    size={18}
                    color="#FFFFFF"
                    style={styles.icon}
                  />
                ) : null}
              </View>
            )}
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 54,
    marginVertical: 10,
    justifyContent: "center",
  },
  bevelBase: {
    position: "absolute",
    top: 4,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#1B4D31",
    borderRadius: 20,
  },
  buttonSurface: {
    height: 50,
    borderRadius: 20,
    backgroundColor: "#2E7D4F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  topRim: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
    borderRadius: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },
  icon: {
    marginLeft: 8,
  },
});
