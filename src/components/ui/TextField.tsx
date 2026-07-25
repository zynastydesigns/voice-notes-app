import { forwardRef, useState } from "react";
import { TextInput, View, Text, Pressable, type TextInputProps } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/config/theme";

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, leftIcon, isPassword, secureTextEntry, style, onFocus, onBlur, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(!!isPassword);

    const borderColor = error
      ? colors.accent.red
      : isFocused
      ? colors.brand[500]
      : colors.border.default;

    return (
      <View className="w-full">
        <Text className="mb-1.5 text-xs font-medium" style={{ color: colors.text.secondary }}>
          {label}
        </Text>
        <View
          className="flex-row items-center rounded-2xl px-4"
          style={{
            height: 54,
            backgroundColor: colors.background.input,
            borderWidth: 1.5,
            borderColor,
          }}
        >
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={19}
              color={isFocused ? colors.brand[400] : colors.text.tertiary}
              style={{ marginRight: 10 }}
            />
          )}
          <TextInput
            ref={ref}
            style={[{ flex: 1, color: colors.text.primary, fontSize: 15.5, height: "100%" }, style]}
            placeholderTextColor={colors.text.tertiary}
            secureTextEntry={isPassword ? isSecure : secureTextEntry}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
          {isPassword && (
            <Pressable hitSlop={10} onPress={() => setIsSecure((s) => !s)}>
              <Ionicons
                name={isSecure ? "eye-outline" : "eye-off-outline"}
                size={19}
                color={colors.text.tertiary}
              />
            </Pressable>
          )}
        </View>
        {!!error && (
          <Animated.Text
            entering={FadeIn.duration(120)}
            exiting={FadeOut.duration(100)}
            className="mt-1.5 text-xs"
            style={{ color: colors.accent.red }}
          >
            {error}
          </Animated.Text>
        )}
      </View>
    );
  }
);

TextField.displayName = "TextField";
