import { View, Text, SafeAreaView, ScrollView, Alert } from "react-native";
import React from "react";
import FormField from "../../components/FormField";
import { useState } from "react";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignIn = () => {
  // const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all the fields");
    }
    setIsSubmiting(true);

    const user = {
      email: form.email,
      password: form.password,
    };
    axios
      .post("http://192.168.0.100:8000/signIn", user, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async (response) => {
        if (response.status === 200 || response.status === 201) {
          await AsyncStorage.removeItem("loggedUser");
          await AsyncStorage.removeItem("token");

          const { token } = response.data;
          await AsyncStorage.setItem("token", token);
          const loggedUser = response.data.username;
          await AsyncStorage.setItem("loggedUser", loggedUser);
          Alert.alert("Success", response.message);
          router.replace("/home-page");
        } else {
          Alert.alert("Username or password incorrect. Try again");
        }
      })
      .catch((error) => {
        console.log("sign in error:", error);
        Alert.alert("Error", error.message);
      });
    setIsSubmiting(false);
  };
  return (
    <SafeAreaView className=" h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6 ">
          <Text className="mx-6 mb-6 text-xl">Log in </Text>
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mx-6"
            keyboardType="email-address"
            placeholder="type email"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mx-6"
            placeholder="type password"
          />
          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="m-6"
            isLoading={isSubmiting}
            textStyles="text-white px-2 p-2"
          />
          <View className="justify-center flex-row gap-2 ">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg text-gray-100 font-psemibold">
              Sign up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
