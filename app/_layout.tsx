
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SQLiteProvider } from "../src/contexts/SQLiteProvider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="achievements" />
          <Stack.Screen name="add-habit" />
        </Stack>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
