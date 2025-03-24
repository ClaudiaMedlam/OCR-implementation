import React from 'react';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false}} />
          <Stack.Screen name="lookup/index" options={{headerShown: false}} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />

      </>
    </GestureHandlerRootView>

  );
}

const styles = StyleSheet.create ({
  container: {
    flex: 1,

  },
});
