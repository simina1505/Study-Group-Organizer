import { View, Text, SafeAreaView, ScrollView, Alert } from "react-native";
import React from "react";
import FormField from "../../components/FormField";
import { useState } from "react";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import { createUser } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
const SignUp = () => {
	const { setUser, setIsLogged } = useGlobalContext();
	const [isSubmiting, setIsSubmiting] = useState(false);
	const [form, setForm] = useState({
		lastName: "",
		firstName: "",
		username: "",
		email: "",
		password: "",
	});

	const submit = async () => {
		if (
			!form.email ||
			!form.password ||
			!form.username ||
			!form.firstName ||
			!form.lastName
		) {
			Alert.alert("Error", "Please fill in all the fields");
		}
		setIsSubmiting(true);
		try {
			const result = await createUser(
				form.email,
				form.password,
				form.username,
				form.firstName,
				form.lastName
			);
			setUser(result);
			setIsLogged(true);

			// set it to global state

			router.replace("/home-page");
		} catch (error) {
			console.log("sign up 46");
			Alert.alert("Error", error.message);
		} finally {
			setIsSubmiting(false);
		}
	};
	return (
		<SafeAreaView className=" h-full">
			<ScrollView>
				<View className="w-full justify-center min-h-[85vh] px-4 my-6 ">
					<Text className="mx-6 mb-6 text-xl">Create an account</Text>
					<FormField
						title="First Name"
						value={form.firstName}
						handleChangeText={(e) => setForm({ ...form, firstName: e })}
						otherStyles="mx-6"
						keyboardType="first-name"
						placeholder="type first name ..."
					/>

					<FormField
						title="Last Name"
						value={form.lastName}
						handleChangeText={(e) => setForm({ ...form, lastName: e })}
						otherStyles="mx-6"
						keyboardType="last-name"
						placeholder="type last name ..."
					/>

					<FormField
						title="Username"
						value={form.username}
						handleChangeText={(e) => setForm({ ...form, username: e })}
						otherStyles="mx-6"
						keyboardType="email-address"
						placeholder="type username ..."
					/>

					<FormField
						title="Email"
						value={form.email}
						handleChangeText={(e) => setForm({ ...form, email: e })}
						otherStyles="mx-6"
						keyboardType="email-address"
						placeholder="type email ..."
					/>
					<FormField
						title="Password"
						value={form.password}
						handleChangeText={(e) => setForm({ ...form, password: e })}
						otherStyles="mx-6"
						placeholder="type password ..."
					/>
					<CustomButton
						title="Sign Up"
						handlePress={submit}
						containerStyles="m-6"
						isLoading={isSubmiting}
						textStyles="text-white px-2 p-2"
					/>

					<View className="justify-center flex-row gap-2 ">
						<Text className="text-lg text-gray-100 font-pregular">
							Have an account already??
						</Text>
						<Link
							href="/sign-in"
							className="text-lg text-gray-100 font-psemibold">
							Sign in
						</Link>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default SignUp;
