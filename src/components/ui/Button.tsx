import { forwardRef } from "react";
import { Pressable, ActivityIndicator, Text, type PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients } from "@/config/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const SIZE_STYLES: Record<ButtonSize, { height: number; paddingX: number; fontSize: number }> = {
  sm: { height: 40, paddingX: 14, fontSize: 14 },
  md: { height: 52, paddingX: 20, fontSize: 16 },
  lg: { height: 58, paddingX: 24, fontSize: 17 },
};

export const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    {
      label,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = true,
      onPressIn,
      onPressOut,
      onPress,
      style,
      ...rest
    },
    ref
  ) => {
    const scale = useSharedValue(1);
    const isDisabled = disabled || isLoading;
    const { height, paddingX, fontSize } = SIZE_STYLES[size];

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn: PressableProps["onPressIn"] = (e) => {
      scale.value = withTiming(0.97, { duration: 90 });
      onPressIn?.(e);
    };
    const handlePressOut: PressableProps["onPressOut"] = (e) => {
      scale.value = withTiming(1, { duration: 120 });
      onPressOut?.(e);
    };
    const handlePress: PressableProps["onPress"] = (e) => {
      if (isDisabled) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onPress?.(e);
    };

    const textColor =
      variant === "primary" || variant === "danger" ? colors.text.primary : colors.brand[300];

    const content = (
      <>
        {isLoading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <>
            {leftIcon}
            <Text
              style={{ color: textColor, fontSize, fontWeight: "600" }}
              className="tracking-tight"
            >
              {label}
            </Text>
            {rightIcon}
          </>
        )}
      </>
    );

    const baseClassName = `flex-row items-center justify-center rounded-2xl gap-2 ${
      fullWidth ? "w-full" : ""
    } ${isDisabled ? "opacity-50" : ""}`;

    if (variant === "primary") {
      return (
        <AnimatedPressable
          ref={ref}
          disabled={isDisabled}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          style={[animatedStyle, style]}
          className={baseClassName}
          {...rest}
        >
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height,
              paddingHorizontal: paddingX,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
            }}
          >
            {content}
          </LinearGradient>
        </AnimatedPressable>
      );
    }

    const variantStyle =
      variant === "danger"
        ? { backgroundColor: colors.accent.red }
        : variant === "outline"
        ? {
            backgroundColor: "transparent",
            borderWidth: 1.5,
            borderColor: colors.border.default,
          }
        : { backgroundColor: "transparent" };

    return (
      <AnimatedPressable
        ref={ref}
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          animatedStyle,
          { height, paddingHorizontal: paddingX, ...variantStyle },
          style,
        ]}
        className={baseClassName}
        {...rest}
      >
        {content}
      </AnimatedPressable>
    );
  }
);

Button.displayName = "Button";
