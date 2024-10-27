import { View, Text } from "react-native";
import { Tabs, Redirect, Stack } from "expo-router";
import React from "react";

const HomeLayout = () => {
	return (
		<>
			{/* <Tabs>
				<Tabs.Screen
					name="home-page"
					option={{
						title: "Home",
						headerShown: false,
						tabBarIcon: ({ color, focused }) => (
							<TabIcon
								icon={icons.home}
								color={color}
								name="home"
								focused={focused}
							/>
						),
					}}
				/>
			</Tabs> */}

			<Stack>
				<Stack.Screen name="home-page" options={{ headerShown: false }} />
			</Stack>
		</>
	);
};

export default HomeLayout;
