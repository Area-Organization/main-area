import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Abstract specific library types into domain types
type FeedbackType = "light" | "medium" | "heavy" | "success" | "error" | "warning" | "selection";

export const feedback = {
  // Wrapper for impact
  impact: async (style: "light" | "medium" | "heavy" = "medium") => {
    if (Platform.OS === "web") return;

    const styles = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy
    };
    await Haptics.impactAsync(styles[style]);
  },

  // Wrapper for notifications
  notification: async (type: "success" | "error" | "warning") => {
    if (Platform.OS === "web") return;

    const types = {
      success: Haptics.NotificationFeedbackType.Success,
      error: Haptics.NotificationFeedbackType.Error,
      warning: Haptics.NotificationFeedbackType.Warning
    };
    await Haptics.notificationAsync(types[type]);
  },

  // Wrapper for selection
  selection: async () => {
    if (Platform.OS === "web") return;
    await Haptics.selectionAsync();
  }
};
