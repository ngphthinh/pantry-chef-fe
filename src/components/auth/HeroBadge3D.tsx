import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface HeroBadge3DProps {
  isDark?: boolean;
}

/** Huy hiệu tĩnh, không animation. */
export function HeroBadge3D({ isDark = true }: HeroBadge3DProps) {
  return (
    <View style={styles.container}>
      {/* Halo tĩnh */}
      <View
        style={[
          styles.glowHalo,
          {
            backgroundColor: isDark
              ? "rgba(46, 125, 79, 0.45)"
              : "rgba(74, 222, 128, 0.35)",
          },
        ]}
      />

      {/* Vòng quỹ đạo tĩnh */}
      <View
        style={[
          styles.orbitRing,
          {
            borderColor: isDark
              ? "rgba(52, 211, 153, 0.4)"
              : "rgba(16, 185, 129, 0.45)",
          },
        ]}
      />

      <View
        style={[
          styles.crestShield,
          {
            backgroundColor: isDark
              ? "rgba(18, 38, 28, 0.85)"
              : "rgba(255, 255, 255, 0.92)",
            borderColor: isDark
              ? "rgba(52, 211, 153, 0.5)"
              : "rgba(46, 125, 79, 0.3)",
          },
        ]}>
        <View style={styles.specularEdge} />
        <View style={styles.iconLayer}>
          <MaterialCommunityIcons
            name="chef-hat"
            size={40}
            color={isDark ? "#4ADE80" : "#2E7D4F"}
          />
          <View style={styles.sparkleBadge}>
            <Ionicons name="sparkles" size={16} color="#FBBF24" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 110,
    height: 110,
    alignSelf: "center",
    marginBottom: 8,
  },
  glowHalo: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    shadowColor: "#34D399",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 6,
  },
  orbitRing: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  crestShield: {
    width: 76,
    height: 76,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  specularEdge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  iconLayer: {
    alignItems: "center",
    justifyContent: "center",
  },
  sparkleBadge: {
    position: "absolute",
    top: -6,
    right: -10,
  },
});
