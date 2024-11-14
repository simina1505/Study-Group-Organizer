import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import CustomButton from "../../../components/CustomButton";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyGroups = () => {
  const [memberGroups, setMemberGroups] = useState([]);
  const [ownedGroups, setOwnedGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchOwnedGroups = async () => {
    try {
      const loggedUser = await getLoggedUser();
      await axios
        .get(`http://192.168.0.101:8000/fetchOwnedGroups/${loggedUser}`)
        .then((response) => {
          setOwnedGroups(response.data.groups);
        })
        .catch((error) => {
          setOwnedGroups();
        });

      await axios
        .get(`http://192.168.0.101:8000/fetchMemberGroups/${loggedUser}`)
        .then((response) => {
          setMemberGroups(response.data.groups);
        })
        .catch(() => {
          setMemberGroups([]);
        });
    } catch (errror) {
      console.log("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnedGroups();
  }, []);

  const openCreateGroupForm = () => {
    router.push("/create-group");
  };

  return (
    <SafeAreaView className=" h-full">
      <ScrollView>
        <View className="w-full justify-center px-4 my-6 ">
          <Text className="mx-6 mb-6 text-xl">My Groups </Text>
          {ownedGroups.length > 0 &&
            ownedGroups.map((group) => (
              <TouchableOpacity
                key={group._id}
                onPress={() => handleGroupPress(group._id)}>
                <Text className="text-xl">{group.name}</Text>
                <Text>{group.description}</Text>
                <Text>{group.privacy}</Text>
              </TouchableOpacity>
            ))}
          <Text className="mx-6 my-6 mb-6 text-xl">Member of</Text>
          {memberGroups.length > 0 &&
            memberGroups.map((group) => (
              <TouchableOpacity
                key={group._id}
                onPress={() => handleGroupPress(group._id)}>
                <Text className="text-xl">{group.name}</Text>
                <Text>{group.description}</Text>
                <Text>{group.privacy}</Text>
              </TouchableOpacity>
            ))}

          <CustomButton
            title="Create Group"
            handlePress={openCreateGroupForm}
            containerStyles="m-6 w-20"
            isLoading={isLoading}
            textStyles="text-white px-2 p-2"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyGroups;
