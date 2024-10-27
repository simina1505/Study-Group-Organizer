import { View, Text } from "react-native";
import { Stack } from "expo-router";
import React from "react";

const ScannerLayout = () => {
	return (
		<>
			<Stack>
				<Stack.Screen name="qr-scanner" options={{ headerShown: false }} />
			</Stack>
		</>
	);
};

export default ScannerLayout;
