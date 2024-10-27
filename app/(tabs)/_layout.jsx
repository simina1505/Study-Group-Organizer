import { View, Text } from "react-native";
import React from "react";
import { Tabs, Redirect } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const TabsLayout = () => {
	return (
		<>
			<Tabs
				screenOptions={{
					tabBarActiveTintColor: "##C9C8BB",
					tabBarStyle: { backgroundColor: "#272737" },
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
						title: "New Group",
						headerShown: false,
						tabBarIcon: ({ color }) => (
							<FontAwesome size={28} name="plus-square" color={color} />
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
				<Tabs.Screen
					name="(profile)"
					options={{
						title: "Profile",
						headerShown: false,
						tabBarIcon: ({ color }) => (
							<FontAwesome size={28} name="user" color={color} />
						),
					}}
				/>
			</Tabs>
		</>
	);
};

export default TabsLayout;
