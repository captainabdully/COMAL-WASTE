import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../contexts/LanguageContext";

export default function LanguageToggle({ light = false }) {
  const { language, setLanguage } = useLanguage();
  const textColor = light ? "#FFFFFF" : "#1F2937";
  const activeBackground = light ? "#FFFFFF" : "#2E7D32";
  const activeText = light ? "#2E7D32" : "#FFFFFF";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      <Ionicons name="language-outline" size={19} color={textColor} />
      {[
        ["en", "EN"],
        ["sw", "SW"],
      ].map(([code, label]) => {
        const selected = language === code;
        return (
          <TouchableOpacity
            key={code}
            accessibilityRole="button"
            accessibilityLabel={code === "en" ? "Switch to English" : "Badilisha hadi Kiswahili"}
            accessibilityState={{ selected }}
            onPress={() => setLanguage(code)}
            style={{
              backgroundColor: selected ? activeBackground : "transparent",
              borderColor: light ? "rgba(255,255,255,0.65)" : "#D1D5DB",
              borderWidth: 1,
              borderRadius: 7,
              minWidth: 34,
              paddingHorizontal: 7,
              paddingVertical: 5,
              alignItems: "center",
            }}
          >
            <Text style={{ color: selected ? activeText : textColor, fontSize: 12, fontWeight: "700" }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
