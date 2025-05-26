import React from "react";
import { View, StyleSheet, ViewStyle, ViewProps } from "react-native";
import theme from "../constants/theme";

interface CardProps extends ViewProps {
  style?: ViewStyle;
  variant?: "default" | "outlined" | "elevated";
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  style,
  variant = "default",
  children,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "outlined":
        return styles.outlined;
      case "elevated":
        return styles.elevated;
      default:
        return styles.default;
    }
  };

  return (
    <View style={[styles.card, getVariantStyle(), style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
  },
  default: {
    borderWidth: 0,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.text.tertiary,
  },
  elevated: {
    ...theme.shadows.small,
  },
});

export default Card;
