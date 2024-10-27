import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/CustomButton";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import { useState } from "react";
import { useGlobalContext } from "../context/GlobalProvider";
//my screen
export default function App() {
	const { isLoading, isLogged } = useGlobalContext();

	if (!isLoading && isLogged) return <Redirect href="/home-page" />;
	return (
		// <View className="flex-1 items-center justify-center bg-white">
		// 	<Text className="text-3xl font-pblack">Study Group Organizer!</Text>
		// 	<StatusBar style="auto" />
		// 	<Link href="(home)/home-page" style={{ color: "blue" }}>
		// 		Go to home
		// 	</Link>
		// </View>

		<SafeAreaView>
			<ScrollView
				contentContainerStyle={{
					height: "100%",
				}}>
				<View className="flex-1 items-center justify-center ">
					<Text>Find your study buddies!</Text>
					<CustomButton
						title="Click here to start"
						handlePress={() => router.push("/sign-in")}
						textStyles="text-white px-2 p-2"></CustomButton>
				</View>
			</ScrollView>
			<ExpoStatusBar />
			{/* pt bateira de la telefon */}
		</SafeAreaView>
	);
}
