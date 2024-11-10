import { View, Text } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

const CreateLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="create-group" options={{ headerShown: false }} />
      </Stack>
      <StatusBar backgroundColor="#161622" style="dark" />
    </>
  );
};

export default CreateLayout;
