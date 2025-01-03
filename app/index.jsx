import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { Redirect, router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/CustomButton";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [loggedUser, setLoggedUser] = useState("");
  useFocusEffect(
    React.useCallback(() => {
      getLoggedUser();
    }, [])
  );

  const getLoggedUser = async () => {
    try {
      const loggedUser = await AsyncStorage.getItem("loggedUser"); //username-ul
      if (loggedUser) {
        console.log(loggedUser);
        setLoggedUser(loggedUser);
      }
      return null;
    } catch (error) {
      console.error("Error retrieving loggedUser:", error);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}>
        <View className="flex-1 items-center justify-center ">
          <Text style={{ fontSize: 40, fontWeight: "bold" }}>
            Study Time Planner
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#555",
              marginBottom: 30,
            }}>
            Find you study buddies
          </Text>
          <CustomButton
            title="Click here to enter"
            handlePress={() =>
              loggedUser != ""
                ? router.push("/home-page")
                : router.push("/sign-in")
            }
            textStyles="text-white px-2 p-2"></CustomButton>
        </View>
      </ScrollView>
      <StatusBar />
      {/* pt bateira de la telefon */}
    </SafeAreaView>
  );
}
