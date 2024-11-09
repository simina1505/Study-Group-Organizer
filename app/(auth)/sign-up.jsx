import { View, Text, SafeAreaView, ScrollView, Alert } from "react-native";
import React from "react";
import FormField from "../../components/FormField";
import { useState } from "react";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import axios from "axios";

const SignUp = () => {
	// const { setUser, setIsLogged } = useGlobalContext();
	const [isSubmiting, setIsSubmiting] = useState(false);
	const [form, setForm] = useState({
		username: "",
		email: "",
		password: "",
		firstName: "",
		lastName: "",
		city: "",
	});

	const submit = () => {
		if (
			!form.email ||
			!form.password ||
			!form.username ||
			!form.firstName ||
			!form.lastName ||
			!form.city
		) {
			Alert.alert("Error", "Please fill in all the fields");
		}
		setIsSubmiting(true);

		const user = {
			username: form.username,
			email: form.email,
			password: form.password,
			firstName: form.firstName,
			lastName: form.lastName,
			city: form.city,
		};
		axios
			.post("http://192.168.1.106:8000/signUp", user)
			.then(() => {
				Alert.alert("Success", "User created successfully!");
				router.replace("/sign-in");
			})
			.catch((error) => {
				console.log("sign up error", error);
				Alert.alert("Error", error.message);
			})
			.finally(() => {
				setIsSubmitting(false);
			});
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
						title="City"
						value={form.city}
						handleChangeText={(e) => setForm({ ...form, city: e })}
						otherStyles="mx-6"
						keyboardType="city"
						placeholder="type city ..."
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
							Have an account already?
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
