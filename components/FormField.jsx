import { View, Text, TextInput } from "react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const FormField = ({
	title,
	value,
	placeholder,
	handleChangeText,
	otherStyles,
	keyboardType,
}) => {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<View className={`space-y-2 ${otherStyles}`}>
			<Text className="text-base text-gray-100">{title}</Text>
			<View
				className=" border-2 rounded-2xl w-full h-16 px-4 bg-gray-100 
            focus:border-black items-center flex-row ">
				<TextInput
					style={{ flex: 1, fontSize: 16, width: 350 }}
					value={value}
					placeholder={placeholder}
					placeholderTextColor="gray"
					onChangeText={handleChangeText}
					secureTextEntry={title === "Password" && !showPassword}
					keyboardType={keyboardType}
				/>

				{title === "Password" && (
					<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
						<Text>
							{showPassword ? (
								<FontAwesome size={18} name="eye-slash" />
							) : (
								<FontAwesome size={18} name="eye" />
							)}
						</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

export default FormField;
