import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

//at first is toucable opacity
const CustomButton = ({
	title,
	handlePress,
	containerStyles,
	textStyles,
	isLoading,
}) => {
	return (
		<TouchableOpacity
			onPress={handlePress}
			activeOpacity={0.7}
			className={`bg-black rounded-xl items-center ${containerStyles} ${
				isLoading ? "opacity-50" : ""
			}`}
			disbaled={isLoading}>
			<Text className={`${textStyles}`}>{`${title}`}</Text>
		</TouchableOpacity>
	);
};

export default CustomButton;
