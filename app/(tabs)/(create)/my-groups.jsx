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
import React, { useState, useEffect } from "react";
import CustomButton from "../../../components/CustomButton";
import { router, useFocusEffect } from "expo-router";
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

  const fetchGroups = async () => {
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

  useFocusEffect(
    React.useCallback(() => {
      fetchGroups();
    }, [])
  );
  useEffect(() => {
    fetchGroups();
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
      setSelectedGroup((prevGroup) => ({
        ...prevGroup,
        requests: [...(prevGroup.requests || []), loggedUser], // Add the logged user to the requests
      }));
      Alert.alert("Success", "You have requested to join the group.");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Unable to join the group.");
      console.error("Error joining group:", error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await axios.delete(`http://172.20.10.5:8000/deleteGroup/${groupId}`);
      Alert.alert("Success", "Group deleted successfully.");
      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      Alert.alert("Error", "Failed to delete group.");
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await axios.post(`http://172.20.10.5:8000/leaveGroup`, {
        groupId,
        username: loggedUser,
      });
      Alert.alert("Success", "You have left the group.");
      fetchGroups();
    } catch (error) {
      console.error("Error leaving group:", error);
      Alert.alert("Error", "Failed to leave the group.");
    }
  };

  const handleEditGroup = (groupId) => {
    router.push(`/edit-group?groupId=${groupId}`);
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
          className="mx-6 mb-6 h-5"
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
          <Text
            className="mt-6 ml-6 mb-6"
            style={{ color: "#b3b3b3", fontWeight: "bold" }}>
            No groups found
          </Text>
        )
      )}
      <ScrollView>
        <View className="w-full justify-center">
          <Text
            className="mx-3 mb-6"
            style={{ fontSize: 25, fontWeight: "bold" }}>
            My Groups
          </Text>
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
                    <View className="flex-row pt-6 ml-14 pl-14">
                      <TouchableOpacity
                        style={{ paddingRight: 10 }}
                        onPress={() => handleEditGroup(group._id)}>
                        <FontAwesome name="pencil" size={24} color="#504357" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteGroup(group._id)}>
                        <FontAwesome name="trash" size={24} color="#504357" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
          <Text
            className="mx-3 mt-3 mb-6"
            style={{ fontSize: 25, fontWeight: "bold" }}>
            Member of
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {memberGroups.length > 0 &&
              memberGroups.map((group) => (
                <View key={group._id}>
                  <View
                    className="flex-row"
                    style={{
                      marginHorizontal: 8,
                      backgroundColor: "black",
                      borderRadius: 12,
                      padding: 2,
                      height: 150,
                    }}>
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
                      <View className="pt-6 ml-14 pl-14">
                        <TouchableOpacity
                          style={{ paddingLeft: 35 }}
                          keyExtractor={(item) => item._id || item.id}
                          onPress={() => handleLeaveGroup(group._id)}>
                          <FontAwesome
                            name="sign-out"
                            size={24}
                            color="#504357"
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </ScrollView>
          <View className="items-center">
            <CustomButton
              title="Create Group"
              handlePress={openCreateGroupForm}
              containerStyles="m-6 w-40"
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
              padding: 10,
              borderRadius: 10,
              width: "80%",
              alignItems: "center",
            }}>
            {selectedGroup && (
              <>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {selectedGroup.name}
                </Text>
                <Text
                  style={{
                    marginVertical: 10,
                    fontWeight: "bold",
                    color: "#555",
                  }}>
                  {selectedGroup.description}
                </Text>
                <View key={selectedGroup._id}>
                  {selectedGroup.subject?.length > 0 && (
                    <View
                      key={selectedGroup._id}
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        paddingLeft: 50,
                      }}>
                      <Text
                        style={{
                          fontSize: 16,
                          paddingTop: 3,
                          fontWeight: "bold",
                          color: "black",
                        }}>
                        Subjects:{"  "}
                      </Text>
                      {selectedGroup.subject.map((subject, index) => (
                        <Text
                          key={index}
                          style={{
                            color: "#555",
                            fontWeight: "bold",
                            marginVertical: 5,
                          }}>
                          {subject}
                          {", "}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    marginVertical: 10,
                    fontWeight: "bold",
                    color: "#555",
                  }}>
                  {selectedGroup.city}
                </Text>
                {selectedGroup.requests?.includes(loggedUser) && (
                  <Text
                    style={{
                      marginVertical: 10,
                      color: "#555",
                      paddingBottom: 2,
                      fontWeight: "bold",
                    }}>
                    Waiting for approval
                  </Text>
                )}
                <View className="flex-row justify-content-between">
                  {selectedGroup.creator != loggedUser &&
                    !selectedGroup.members?.includes(loggedUser) &&
                    !selectedGroup.requests?.includes(loggedUser) && (
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
