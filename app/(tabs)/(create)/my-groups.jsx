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
import FontAwesome from "@expo/vector-icons/FontAwesome";

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
        .get(`http://172.20.10.5:8000/fetchOwnedGroups/${loggedUser}`)
        .then((response) => {
          setOwnedGroups(response.data.groups);
        })
        .catch((error) => {
          setOwnedGroups();
        });

      await axios
        .get(`http://172.20.10.5:8000/fetchMemberGroups/${loggedUser}`)
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

  const handleGroupPress = (groupId) => {
    router.push(`/group-page?groupId=${groupId}`);
  };

  return (
    <SafeAreaView className=" h-full">
      <ScrollView>
        <View className="w-full justify-center px-4 my-6 ">
          <Text className="mx-6 mb-6 text-xl">My Groups </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ownedGroups.length > 0 &&
              ownedGroups.map((group) => (
                <View
                  className="flex-row"
                  style={{
                    marginHorizontal: 8,
                    backgroundColor: "black",
                    borderRadius: 12,
                    padding: 2,
                    height: 200,
                  }}
                  key={group._id}>
                  <TouchableOpacity
                    style={{
                      width: 200,
                      padding: 10,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 8,
                    }}
                    onPress={() => handleGroupPress(group._id)}>
                    <View className="flex-row pb-6">
                      <Text className="text-xl font-bold mr-2">
                        {group.name}
                      </Text>
                      <View className="pt-1">
                        {group.privacy === "Private" ? (
                          <FontAwesome size={20} name="lock" />
                        ) : (
                          <FontAwesome size={20} name="unlock" />
                        )}
                      </View>
                    </View>
                    <Text className="text-gray-500">{group.description}</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
          <Text className="mx-6 my-6 mb-6 text-xl">Member of</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {memberGroups.length > 0 &&
              memberGroups.map((group) => (
                <View
                  className="flex-row"
                  style={{
                    marginHorizontal: 8,
                    backgroundColor: "black",
                    borderRadius: 12,
                    padding: 2,
                    height: 200,
                  }}
                  key={group._id}>
                  <TouchableOpacity
                    style={{
                      width: 200,
                      padding: 10,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 8,
                    }}
                    onPress={() => handleGroupPress(group._id)}>
                    <View className="flex-row pb-6">
                      <Text className="text-xl font-bold mr-2">
                        {group.name}
                      </Text>
                      <View className="pt-1">
                        {group.privacy === "Private" ? (
                          <FontAwesome size={20} name="lock" />
                        ) : (
                          <FontAwesome size={20} name="unlock" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
          <View className="items-center">
            <CustomButton
              title="Create Group"
              handlePress={openCreateGroupForm}
              containerStyles="m-6 w-40"
              isLoading={isLoading}
              textStyles="text-white px-2 p-2"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyGroups;
