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

const SearchInput = ({ searchType, placeholder, onSearchResults }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  //const [location, setLocation] = useState(null);

  // const fetchLocation = async () => {
  //   try {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       Alert.alert(
  //         "Permission Denied",
  //         "We need location access to provide better results."
  //       );
  //       return;
  //     }
  //     const loc = await Location.getCurrentPositionAsync({});
  //     setLocation(loc.coords);
  //     console.log(location);
  //   } catch (error) {
  //     console.error("Error fetching location:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchLocation();
  // }, []);

  const handleSearchResults = useCallback(
    (data) => {
      onSearchResults(data);
    },
    [onSearchResults]
  );

  useEffect(() => {
    let debounceTimeout;

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
