import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import CustomButton from "../../../components/CustomButton";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import SearchInput from "../../../components/SearchInput";

const MyGroups = () => {
  const [memberGroups, setMemberGroups] = useState([]);
  const [ownedGroups, setOwnedGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);

  const getLoggedUser = async () => {
    try {
      setIsLoading(true);
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

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const handleGroupModal = (group) => {
    setSelectedGroup(group);
    setModalVisible(true);
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const loggedUser = await getLoggedUser();
      await axios.post(`http://172.20.10.5:8000/sendRequestToJoin`, {
        groupId,
        username: loggedUser,
      });
      Alert.alert("Success", "You have joined the group.");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Unable to join the group.");
      console.error("Error joining group:", error);
    }
  };

  return (
    <SafeAreaView className=" h-full">
      <SearchInput
        searchType="Groups"
        placeholder="Search for groups..."
        onSearchResults={handleSearchResults}
      />

      {loadingSearch && <ActivityIndicator size="large" color="#0000ff" />}

      {searchResults.length > 0 ? (
        <FlatList
          className="mx-6 mb-6 h-10"
          data={searchResults}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleGroupModal(item)}
              style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 16, color: "#333" }}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={{ marginTop: 16 }}
        />
      ) : (
        searchResults.length === 0 && (
          <Text className="mt-6 ml-6 mb-6">No groups found</Text>
        )
      )}
      <ScrollView>
        <View className="w-full justify-center">
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
                    height: 150,
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
                    height: 150,
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

      {/* Modal for Group Details */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}>
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "80%",
              alignItems: "center",
            }}>
            {selectedGroup && (
              <>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {selectedGroup.name}
                </Text>
                <Text style={{ marginVertical: 10, color: "#555" }}>
                  {selectedGroup.description}
                </Text>
                <View className="flex-row justify-content-between">
                  {selectedGroup.privacy === "Public" &&
                    selectedGroup.creator != loggedUser &&
                    !selectedGroup.members?.include(loggedUser)(
                      <CustomButton
                        title="Join Group"
                        handlePress={() => handleJoinGroup(selectedGroup._id)}
                        containerStyles="w-30"
                        textStyles="text-white px-2 p-2"
                      />
                    )}
                  <CustomButton
                    title="Close"
                    handlePress={() => setModalVisible(false)}
                    containerStyles="w-30"
                    textStyles="text-white px-2 p-2"
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MyGroups;
