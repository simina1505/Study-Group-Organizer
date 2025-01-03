import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SearchInput = ({ searchType, placeholder, onSearchResults }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loggedUserId, setLoggedUserId] = useState("");

  const handleSearchResults = useCallback(
    (data) => {
      onSearchResults(data);
    },
    [onSearchResults]
  );

  const getLoggedUserId = async () => {
    try {
      const loggedUserId = await AsyncStorage.getItem("loggedUserId");
      if (loggedUserId) {
        setLoggedUserId(loggedUserId);
      }
      return null;
    } catch (error) {
      console.error("Error retrieving loggedUserId:", error);
    }
  };

  useEffect(() => {
    let debounceTimeout;
    getLoggedUserId();
    if (isTyping) {
      debounceTimeout = setTimeout(() => {
        if (query.trim() === "") {
          handleSearchResults([]);
          setLoading(false);
          setIsTyping(false);
          return;
        }

        const fetchResults = async () => {
          setLoading(true);
          try {
            //console.log(location);
            const response = await axios.get(
              `http://172.20.10.5:8000/search${searchType}`,
              {
                params: {
                  query,
                  userId: loggedUserId,
                  // lat: location?.latitude, // Send latitude
                  // lng: location?.longitude, // Send longitude
                },
              }
            );
            const data = response.data.groups || [];
            handleSearchResults(data);
          } catch (error) {
            console.error("Error fetching results:", error);
          } finally {
            setLoading(false);
            setIsTyping(false);
          }
        };

        fetchResults();
      }, 500);
    }

    return () => clearTimeout(debounceTimeout);
  }, [query, searchType, handleSearchResults, isTyping]);

  const handleInputChange = (text) => {
    setQuery(text);
    setIsTyping(true);
  };

  return (
    <View className="flex px-4 pt-2">
      <TextInput
        className="p-2 border rounded"
        placeholder={placeholder}
        value={query}
        onChangeText={handleInputChange}
      />
      {loading && <ActivityIndicator size="small" color="#0000ff" />}
    </View>
  );
};

export default SearchInput;
