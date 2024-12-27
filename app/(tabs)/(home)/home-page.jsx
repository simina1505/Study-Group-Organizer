import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const HomePage = () => {
  const [sessions, setSessions] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [daySessions, setDaySessions] = useState([]);

  useEffect(() => {
    const initialize = async () => {
      await getLoggedUser();
      setSelectedDay(getCurrentDate());
    };

    initialize();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (username) {
        fetchUserSessions();
      }
    }, [username])
  );
  const getLoggedUser = async () => {
    try {
      setLoading(true);
      const loggedUser = await AsyncStorage.getItem("loggedUser"); //username-ul
      if (loggedUser) {
        setUsername(loggedUser);
      }
    } catch (error) {
      console.error("Error retrieving loggedUser:", error);
    }
  };

  const fetchUserSessions = async () => {
    try {
      const response = await axios.get(
        `http://172.20.10.5:8000/fetchUserSessions/${username}`
      );

      if (response.data.success) {
        const sessions = response.data.sessions;
        setSessions(sessions || []);
        markSessionDates(sessions);
      } else {
        Alert.alert("Error", "Failed to fetch sessions.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while fetching sessions.");
    } finally {
      setLoading(false);
    }
  };

  const markSessionDates = (sessions) => {
    const marked = {};
    const sessionColors = {};

    sessions.forEach((session) => {
      const { startDate, endDate, startTime, endTime, name } = session;
      const start = new Date(startDate);
      const end = new Date(endDate);

      const color = sessionColors[name] || getColorFromName(name); // Get or generate color
      sessionColors[name] = color;

      if (
        start.toISOString().split("T")[0] === end.toISOString().split("T")[0]
      ) {
        const dateString = start.toISOString().split("T")[0]; // YYYY-MM-DD format

        if (!marked[dateString]) {
          marked[dateString] = {
            selected: true,
            marked: true,
            selectedColor: "purple",
            dotColor: "white",
            textColor: "white",
            sessions: [],
          };
        }

        const sessionStartTime = new Date(`${dateString}T${startTime}`);
        const sessionEndTime = new Date(`${dateString}T${endTime}`);

        marked[dateString].sessions.push({
          name,
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          color: color,
        });
      } else {
        while (start <= end) {
          const dateString = start.toISOString().split("T")[0];

          if (!marked[dateString]) {
            marked[dateString] = {
              selected: true,
              marked: true,
              selectedColor: "purple",
              dotColor: "white",
              textColor: "white",
              sessions: [],
            };
          }

          let sessionStartTime, sessionEndTime;

          if (start.toISOString().split("T")[0] === startDate.split("T")[0]) {
            sessionStartTime = new Date(`${dateString}T${startTime}`);
            sessionEndTime = new Date(`${dateString}T23:59`);
          } else if (
            start.toISOString().split("T")[0] === endDate.split("T")[0]
          ) {
            sessionStartTime = new Date(`${dateString}T00:00`);
            sessionEndTime = new Date(`${dateString}T${endTime}`);
          } else {
            sessionStartTime = new Date(`${dateString}T00:00`);
            sessionEndTime = new Date(`${dateString}T23:59`);
          }

          marked[dateString].sessions.push({
            name,
            startTime: sessionStartTime,
            endTime: sessionEndTime,
            color: color,
          });

          start.setDate(start.getDate() + 1);
        }
      }
    });

    setMarkedDates(marked);
  };

  const handleDayPress = (day) => {
    setSelectedDay(day.dateString);
    const sessionsForDay = markedDates[day.dateString]?.sessions || [];
    setDaySessions(sessionsForDay);
  };

  const getColorFromName = (name) => {
    // Simple hash function to generate a number based on the session name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate a color from the hash value
    const hue = Math.abs(hash % 360);
    const saturation = 50 + (Math.abs(hash) % 50);
    const lightness = 50 + (Math.abs(hash) % 20);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const renderTimeline = () => {
    if (!selectedDay || !markedDates[selectedDay]?.sessions?.length > 0) {
      return (
        <View style={{ padding: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#666" }}>
            No sessions for this day.
          </Text>
        </View>
      );
    }

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return hours.map((hour) => {
      const sessionBlocks = daySessions.filter((session) => {
        const startHour = session.startTime.getHours();
        const endHour = session.endTime.getHours();
        return hour >= startHour && hour <= endHour;
      });
      return (
        <View
          key={hour}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 8,
            backgroundColor:
              sessionBlocks.length > 0 ? sessionBlocks[0].color : "#f0f0f0", // Color the first session's block
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
          }}>
          <Text style={{ width: 50, textAlign: "center" }}>{hour}:00</Text>
          {sessionBlocks.length > 0 && (
            <Text
              style={{
                marginLeft: 10,
                color: "black",
                fontWeight: "bold",
              }}>
              {sessionBlocks.map((session, index) => (
                <Text key={index}>{session.name}</Text>
              ))}
            </Text>
          )}
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
          Your Sessions Calendar
        </Text>
        <Calendar
          markedDates={markedDates}
          theme={{
            todayTextColor: "red",
            arrowColor: "blue",
            dotColor: "white",
            selectedDayBackgroundColor: "blue",
            selectedDayTextColor: "white",
          }}
          onDayPress={handleDayPress}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", marginVertical: 16 }}>
          {selectedDay
            ? `Sessions for ${selectedDay}`
            : "Select a day to see sessions"}
        </Text>
        <ScrollView style={{ flex: 1 }}>{renderTimeline()}</ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomePage;
