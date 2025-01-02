import { View, Text, SafeAreaView, ScrollView, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar } from "react-native-calendars";
import DateTimePicker from "@react-native-community/datetimepicker";

const EditSession = () => {
  const { sessionId } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    acceptedBy: [],
  });
  const [markedDates, setMarkedDates] = useState({});
  const [selecting, setSelecting] = useState("startDate");
  const [validationErrors, setValidationErrors] = useState({});
  const [loggedUser, setLoggedUser] = useState(null);
  const [groupId, setGroupId] = useState("");

  const getLoggedUser = async () => {
    try {
      const loggedUser = await AsyncStorage.getItem("loggedUser"); //username-ul
      if (loggedUser) {
        setLoggedUser(loggedUser);
        return loggedUser;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving loggedUser:", error);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionsData();
      getLoggedUser();
    }
  }, [sessionId]);

  const fetchSessionsData = async () => {
    try {
      const response = await axios.get(
        `http://172.20.10.5:8000/fetchSession/${sessionId}`
      );
      if (response.data.success) {
        const sessionData = response.data.session;
        setForm({
          name: sessionData.name,
          startDate: sessionData.startDate,
          endDate: sessionData.endDate,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
          acceptedBy: sessionData.acceptedBy || [],
        });
        setGroupId(sessionData.groupId);
        console.log(groupId);
        const formattedStartDate = formatForCalendar(sessionData.startDate);
        const formattedEndDate = formatForCalendar(sessionData.endDate);

        setMarkedDates({
          [formattedStartDate.dateString]: {
            selected: true,
            selectedColor: "blue",
          },
          [formattedEndDate.dateString]: {
            selected: true,
            selectedColor: "purple",
          },
        });
        console.log(sessionData.startDate);
        console.log(sessionData.endDate);
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  const validateField = (field, value) => {
    let error = "";

    const now = new Date();

    if (
      field === "endDate" &&
      value &&
      form.startDate &&
      value < form.startDate
    ) {
      error = "End date cannot be before the start date.";
    }

    if (
      field === "endTime" &&
      value &&
      form.startTime &&
      value <= form.startTime &&
      form.startDate === form.endDate
    ) {
      error = "End time must be after start time for the same day.";
    }

    if (
      field === "startTime" &&
      form.startDate &&
      value &&
      new Date(`${form.startDate}T${value}`) <= now
    ) {
      error = "Start time must be after the current date and time.";
    }

    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };

  const formatForCalendar = (isoDate) => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are 0-indexed
    const day = date.getDate();
    return {
      dateString: `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`,
      day: day,
      month: month,
      year: year,
      timestamp: date.getTime(),
    };
  };

  const handleDateSelect = (day) => {
    const field = selecting;
    const value = day.dateString;
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [field]: value };

      // Update marked dates, remove the previous marked date
      setMarkedDates((prevMarkedDates) => {
        const updatedDates = { ...prevMarkedDates };

        // Remove the old marked date if selecting start or end date
        if (selecting === "startDate" && prevForm.startDate) {
          delete updatedDates[prevForm.startDate];
        }
        if (selecting === "endDate" && prevForm.endDate) {
          delete updatedDates[prevForm.endDate];
        }

        // Add the new selected date
        updatedDates[value] = {
          selected: true,
          selectedColor: selecting === "startDate" ? "blue" : "purple",
        };

        return updatedDates;
      });

      return updatedForm;
    });
  };

  const handleTimeConfirm = (field, selectedTime) => {
    const value = selectedTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setForm((prevForm) => ({ ...prevForm, [field]: value }));
    validateField(field, value);
  };

  const isFormValid = () => {
    return (
      Object.values(validationErrors).every((error) => !error) &&
      Object.values(form).every((value) => value)
    );
  };

  const submit = async () => {
    if (!isFormValid()) {
      Alert.alert("Error", "Please fix all errors before submitting.");
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
    console.log(session);
    console.log(sessionId);
    try {
      const response = await axios.post(
        `http://172.20.10.5:8000/editSession/${sessionId}`,
        session
      );

      if (response.data.success) {
        Alert.alert("Success", response.data.message);
        router.push(`/group-page?groupId=${groupId}`);
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      console.error("Error updating session:", error);
      Alert.alert("Error", "Could not update session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancel = () => {
    router.replace(`/group-page?groupId=${form.groupId}`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Edit Session
        </Text>

        <FormField
          title="Session Name"
          value={form.name}
          handleChangeText={(text) => setForm({ ...form, name: text })}
          placeholder="Enter session name"
        />
        {validationErrors.name && (
          <Text style={{ color: "red", fontSize: 12 }}>
            {validationErrors.name}
          </Text>
        )}

        <View style={{ marginVertical: 16 }}>
          <Text style={{ fontSize: 16 }}>
            {selecting === "startDate"
              ? "Selecting Start Date"
              : "Selecting End Date"}
          </Text>
          <Calendar
            current={form[selecting] || undefined}
            markedDates={markedDates}
            onDayPress={handleDateSelect}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 10,
            }}>
            <CustomButton
              title="Start Date"
              handlePress={() => setSelecting("startDate")}
              containerStyles="m-6"
              textStyles="text-white px-2 p-2"
            />
            <CustomButton
              title="End Date"
              handlePress={() => setSelecting("endDate")}
              containerStyles="m-6"
              textStyles="text-white px-2 p-2"
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 16,
          }}>
          <View>
            <Text>Start Time</Text>
            <DateTimePicker
              value={
                form.startTime
                  ? new Date(`1970-01-01T${form.startTime}:00`)
                  : new Date()
              }
              mode="time"
              onChange={(event, selectedDate) => {
                if (selectedDate) handleTimeConfirm("startTime", selectedDate);
              }}
            />
          </View>
          <View>
            <Text>End Time</Text>
            <DateTimePicker
              value={
                form.endTime
                  ? new Date(`1970-01-01T${form.endTime}:00`)
                  : new Date()
              }
              mode="time"
              onChange={(event, selectedDate) => {
                if (selectedDate) handleTimeConfirm("endTime", selectedDate);
              }}
            />
          </View>
        </View>
        <View classname="flex-row">
          <CustomButton
            title="Save Changes"
            handlePress={submit}
            isLoading={isSubmitting}
            containerStyles="m-1"
            textStyles="text-white px-2 p-2"
          />
          <CustomButton
            title="Cancel"
            handlePress={cancel}
            containerStyles="m-1"
            textStyles="text-white px-2 p-2"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditSession;