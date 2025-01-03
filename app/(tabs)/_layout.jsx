import { View, Text } from "react-native";
import React from "react";
import { Tabs, Redirect } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#504357",
          tabBarInactiveTintColor: "#7f6b89",
          tabBarStyle: { backgroundColor: "#c6bccb" },
        }}>
        <Tabs.Screen
          name="(home)"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(create)"
          options={{
            title: "Groups",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="group" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(scanner)"
          options={{
            title: "QR Scanner",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="qrcode" color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
