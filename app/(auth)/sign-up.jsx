import { View, Text, SafeAreaView, ScrollView, Alert } from "react-native";
import React from "react";
import FormField from "../../components/FormField";
import { useState } from "react";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import axios from "axios";

const SignUp = () => {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    city: "",
  });

  const [errors, setErrors] = useState({});

  const validateUsername = async (username) => {
    if (!username) return "Username is required.";
    if (username.length < 3)
      return "Username must be at least 3 characters long.";

    try {
      const response = await axios.post(
        "http://172.20.10.5:8000/checkUserExistence",
        {
          field: "username",
          value: username,
        }
      );
      if (!response.data.available) return "Username is already taken.";
    } catch (error) {
      console.error("Error checking username availability:", error);
      return "Error checking username.";
    }
    return "";
  };

  const validateEmail = async (email) => {
    if (!email) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format.";

    try {
      const response = await axios.post(
        "http://172.20.10.5:8000/checkUserExistence",
        {
          field: "email",
          value: email,
        }
      );
      if (!response.data.available) return "Email is already in use.";
    } catch (error) {
      console.error("Error checking email availability:", error);
      return "Error checking email.";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required.";
    if (password.length < 8)
      return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number.";
    return "";
  };

  const handleChangeText = async (field, value) => {
    setForm({ ...form, [field]: value });

    let errorMessage = "";
    if (field === "username") errorMessage = await validateUsername(value);
    if (field === "email") errorMessage = await validateEmail(value);
    if (field === "password") errorMessage = validatePassword(value);

    setErrors({ ...errors, [field]: errorMessage });
  };

  const submit = () => {
    const formErrors = Object.values(errors).filter((error) => error !== "");
    if (formErrors.length > 0) {
      Alert.alert("Error", "Please fix the errors in the form.");
      return;
    }

    if (Object.values(form).some((field) => !field)) {
      Alert.alert("Error", "Please fill in all the fields.");
      return;
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
      .post("http://172.20.10.5:8000/signUp", user)
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
          <Text
            className="mx-6 mb-3"
            style={{ fontSize: 35, fontWeight: "bold" }}>
            Create an account
          </Text>
          {[
            {
              title: "First Name",
              field: "firstName",
              placeholder: "type first name ...",
            },
            {
              title: "Last Name",
              field: "lastName",
              placeholder: "type last name ...",
            },
            {
              title: "Username",
              field: "username",
              placeholder: "type username ...",
            },
            { title: "Email", field: "email", placeholder: "type email ..." },
            { title: "City", field: "city", placeholder: "type city ..." },
            {
              title: "Password",
              field: "password",
              placeholder: "type password ...",
            },
          ].map(({ title, field, placeholder }) => (
            <View key={field}>
              <FormField
                title={title}
                value={form[field]}
                handleChangeText={(e) => handleChangeText(field, e)}
                otherStyles="mx-6"
                placeholder={placeholder}
              />
              {errors[field] && (
                <Text className="mx-6 text-red-600 text-sm">
                  {errors[field]}
                </Text>
              )}
            </View>
          ))}
          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles="m-6"
            isLoading={isSubmiting}
            textStyles="text-white px-2 p-2"
          />

          <View className="justify-center flex-row gap-2 ">
            <Text
              className="text-lg font-pregular"
              style={{ color: "#b3b3b3" }}>
              Have an account already?
            </Text>
            <Link
              href="/sign-in"
              className="text-lg font-psemibold"
              style={{ color: "#757575" }}>
              Sign in
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
