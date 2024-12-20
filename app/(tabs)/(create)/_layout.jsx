import { View, Text } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

const CreateLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="my-groups" options={{ headerShown: false }} />
        <Stack.Screen name="create-group" options={{ headerShown: false }} />
      </Stack>
      <StatusBar />
    </>
  );
};

export default CreateLayout;
