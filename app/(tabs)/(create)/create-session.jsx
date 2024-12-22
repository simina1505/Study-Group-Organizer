import { View, Text, SafeAreaView, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar } from "react-native-calendars";
import DateTimePicker from "@react-native-community/datetimepicker";

const CreateSession = () => {
  const { groupId } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    acceptedBy: [],
  });

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selecting, setSelecting] = useState("startDate");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDateSelect = (day) => {
    setForm((prevForm) => ({ ...prevForm, [selecting]: day.dateString }));
    setErrorMessage("");
  };

  const handleTimeConfirm = (field, selectedTime) => {
    setForm({
      ...form,
      [field]: selectedTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
    setErrorMessage("");
  };

  const validateSessionTimes = () => {
    if (!form.startDate || !form.endDate || !form.startTime || !form.endTime) {
      return false;
    }

    const startDateTime = new Date(`${form.startDate}T${form.startTime}:00`);
    const endDateTime = new Date(`${form.endDate}T${form.endTime}:00`);

    if (startDateTime >= endDateTime) {
      setErrorMessage("Start time cannot be after or equal to end time.");
      return false;
    }

    return true;
  };

  const getLoggedUser = async () => {
    try {
      setIsLoading(true);
      const loggedUser = await AsyncStorage.getItem("loggedUser"); //username-ul
      if (loggedUser) {
        return loggedUser;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving loggedUser:", error);
    }
  };

  const submit = async () => {
    if (
      !form.name ||
      !form.startDate ||
      !form.endDate ||
      !form.startTime ||
      !form.endTime
    ) {
      Alert.alert("Error", "Please fill in all the fields.");
      return;
    }

    if (!validateSessionTimes()) {
      return;
    }

    const loggedUser = await getLoggedUser();
    if (!loggedUser) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    setIsSubmitting(true);

    const session = {
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: form.startTime,
      endTime: form.endTime,
      acceptedBy: [loggedUser],
      groupId: groupId,
    };

    try {
      await axios
        .post("http://172.20.10.5:8000/createSession", session)
        .then((response) => {})
        .catch((error) => {
          Alert.alert("Error", error.message);
          console.log("group session error:", error);
        });
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsSubmiting(false);
    }
  };

  const cancel = () => {
    router.replace(`/group-page?groupId=${groupId}`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Create Session
        </Text>

        <FormField
          title="Session Name"
          value={form.name}
          handleChangeText={(text) => setForm({ ...form, name: text })}
          placeholder="Enter session name"
        />

        <View style={{ marginVertical: 16 }}>
          <Text style={{ fontSize: 16 }}>
            {selecting === "startDate"
              ? "Selecting Start Date"
              : "Selecting End Date"}
          </Text>
          <Calendar
            current={form[selecting] || undefined}
            markedDates={{
              [form.startDate]: { selected: true, selectedColor: "blue" },
              [form.endDate]: { selected: true, selectedColor: "purple" },
            }}
            onDayPress={handleDateSelect}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 10,
            }}>
            <CustomButton
              title="Select Start Date"
              handlePress={() => setSelecting("startDate")}
              textStyles="text-white px-2 p-2"
            />
            <CustomButton
              title="Select End Date"
              handlePress={() => setSelecting("endDate")}
              textStyles="text-white px-2 p-2"
            />
          </View>
        </View>

        <View className="flex-row items-center pb-2 pl-14">
          <View className="items-center pb-4 pr-14 mr-10">
            <Text className="pb-2">Start Time</Text>
            <DateTimePicker
              value={
                form.startTime
                  ? new Date(`1970-01-01T${form.startTime}:00`)
                  : new Date()
              }
              mode="time"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  handleTimeConfirm("startTime", selectedDate);
                }
              }}
            />
          </View>

          <View className="items-center pb-4">
            <Text className="items-center pb-2">End Time</Text>
            <DateTimePicker
              value={
                form.endTime
                  ? new Date(`1970-01-01T${form.endTime}:00`)
                  : new Date()
              }
              mode="time"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  handleTimeConfirm("endTime", selectedDate);
                }
              }}
            />
          </View>
        </View>

        {errorMessage && (
          <Text style={{ color: "red", marginTop: 8 }}>{errorMessage}</Text>
        )}

        <View className="flex-row items-center mx-14 mb-4">
          <CustomButton
            title="Create"
            handlePress={submit}
            containerStyles="m-6 w-50"
            textStyles="text-white px-2 p-2"
          />

          <CustomButton
            title="Back to group"
            handlePress={cancel}
            containerStyles="m-6 w-30"
            textStyles="text-white px-2 p-2"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateSession;
