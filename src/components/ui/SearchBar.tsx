import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/config/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search notes, transcripts, keywords...",
  onFilterPress,
  onSubmitEditing,
  autoFocus,
}: SearchBarProps) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View
        className="flex-1 flex-row items-center rounded-2xl px-4"
        style={{ height: 48, backgroundColor: colors.background.card }}
      >
        <Ionicons name="search" size={18} color={colors.text.tertiary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          style={{ flex: 1, marginLeft: 8, color: colors.text.primary, fontSize: 14.5, height: "100%" }}
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
        />
        {!!value && (
          <Pressable hitSlop={10} onPress={() => onChangeText("")}>
            <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
          </Pressable>
        )}
      </View>
      {!!onFilterPress && (
        <Pressable
          onPress={onFilterPress}
          className="items-center justify-center rounded-2xl"
          style={{ width: 48, height: 48, backgroundColor: colors.background.card }}
        >
          <Ionicons name="options-outline" size={19} color={colors.text.primary} />
        </Pressable>
      )}
    </View>
  );
}
