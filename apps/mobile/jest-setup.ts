import "react-native-gesture-handler/jestSetup";
import React from "react";
import { View } from "react-native";

// Mock Reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Expo Router
jest.mock("expo-router", () => {
  const { useEffect } = require("react");
  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      dismissAll: jest.fn(),
      navigate: jest.fn()
    }),
    useSegments: () => [],
    useFocusEffect: (callback: () => void) => useEffect(callback, []),
    Link: "Link",
    Stack: {
      Screen: "Stack.Screen"
    }
  };
});

// Mock SafeAreaContext
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: any) => children
}));

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy"
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error"
  }
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock SecureStore
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

// Mock Expo Font
jest.mock("expo-font", () => ({
  isLoaded: jest.fn().mockReturnValue(true),
  loadAsync: jest.fn().mockResolvedValue(true),
  useFonts: () => [true, null]
}));

// Mock Vector Icons
const MockIcon = (props: any) => {
  return React.createElement(View, props);
};

jest.mock("@expo/vector-icons/MaterialIcons", () => MockIcon);
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: MockIcon,
  FontAwesome: MockIcon,
  FontAwesome5: MockIcon,
  Ionicons: MockIcon,
  MaterialCommunityIcons: MockIcon,
  Entypo: MockIcon,
  Feather: MockIcon,
  AntDesign: MockIcon,
  Octicons: MockIcon
}));
