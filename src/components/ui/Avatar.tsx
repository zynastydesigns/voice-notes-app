import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "@/config/theme";

interface AvatarProps {
  photoURL?: string | null;
  name?: string | null;
  size?: number;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export function Avatar({ photoURL, name, size = 44 }: AvatarProps) {
  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: size * 0.38 }}>
        {getInitials(name)}
      </Text>
    </LinearGradient>
  );
}
