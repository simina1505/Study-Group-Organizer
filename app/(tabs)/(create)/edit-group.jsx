import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import React, { useEffect, useState } from "react";
import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditGroup = () => {
  const { groupId } = useLocalSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    privacy: "Public",
    city: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (groupId) {
      getGroupData();
    }
  }, [groupId]);

  const getLoggedUser = async () => {
    try {
      const loggedUser = await AsyncStorage.getItem("loggedUser");
      if (loggedUser) {
        return loggedUser;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving loggedUser:", error);
    }
  };

  const getGroupData = async () => {
    try {
      const response = await axios.get(
        `http://172.20.10.5:8000/fetchGroup/${groupId}`
      );
      if (response.data.success) {
        const groupData = response.data.group;
        setForm({
          name: groupData.name,
          description: groupData.description,
          privacy: groupData.privacy,
          city: groupData.city,
        });
        setSubjects(groupData.subject);
      }
    } catch (error) {
      console.error("Error fetching group data:", error);
    }
  };

  const togglePrivacy = () => {
    setForm((prevForm) => ({
      ...prevForm,
      privacy: prevForm.privacy === "Public" ? "Private" : "Public",
    }));
  };

  const handleChangeText = async (field, value) => {
    setForm({ ...form, [field]: value });

    let errorMessage = "";
    errorMessage = await validateGroupName(value);

    setErrors({ ...errors, [field]: errorMessage });
  };

  const validateGroupName = async (name) => {
    if (!name) return "Group name is required.";
    try {
      const response = await axios.post(
        "http://172.20.10.5:8000/checkGroupExistence",
        {
          field: "name",
          value: name,
        }
      );
      if (!response.data.available) return "Group name is already taken.";
    } catch (error) {
      console.error("Error checking group name availability:", error);
      return "Error checking group name.";
    }
    return "";
  };

  const submit = async () => {
    const loggedUser = await getLoggedUser();
    if (!loggedUser) {
      Alert.alert("Error", "User not logged in");
      setIsSubmiting(false);
      return;
    }

    setIsSubmiting(true);
    const group = {
      name: form.name,
      description: form.description,
      subject: subjects,
      privacy: form.privacy,
      creator: loggedUser,
      city: form.city,
    };

    try {
      await axios
        .post(`http://172.20.10.5:8000/editGroup/${groupId}`, group)
        .then((response) => {
          if (response && response.data.success === true) {
            Alert.alert("Success", "Group updated successfully");
            router.replace("/my-groups");
          } else {
            Alert.alert("Error", "Please fix all the fields.");
          }
        })
        .catch((error) => {
          Alert.alert("Error", error.message);
        });
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsSubmiting(false);
    }
  };

  const cancel = () => {
    router.replace("/my-groups");
  };

  return (
    <SafeAreaView className="h-full">
      <ScrollView>
        <View className="w-full justify-center px-4 my-6">
          <Text className="mx-6 mb-6 text-xl">Edit Group</Text>

          <FormField
            title="Group Name"
            value={form.name}
            handleChangeText={(e) => handleChangeText("name", e)}
            otherStyles="mx-6"
            keyboardType="default"
            placeholder="type group name"
          />
          {errors["name"] && (
            <Text className="mx-6 text-red-600 text-sm">{errors["name"]}</Text>
          )}

          <FormField
            title="Description"
            value={form.description}
            handleChangeText={(e) => setForm({ ...form, description: e })}
            otherStyles="mx-6 mb-4"
            keyboardType="default"
            placeholder="type a description"
          />

          <View className="flex-row items-center mx-6 mb-4">
            <Text className="text-lg mr-2">{form.privacy}</Text>
            <Switch
              value={form.privacy === "Private"}
              onValueChange={togglePrivacy}
            />
          </View>

          <FormField
            title="City"
            value={form.city}
            handleChangeText={(e) => setForm({ ...form, city: e })}
            otherStyles="mx-6 mb-4"
            keyboardType="default"
            placeholder="pick a city"
          />

          <View className="flex-row items-center mx-14 mb-4">
            <CustomButton
              title="Save Changes"
              handlePress={submit}
              containerStyles="m-6"
              isLoading={isSubmiting}
              textStyles="text-white px-2 p-2"
            />

            <CustomButton
              title="Cancel"
              handlePress={cancel}
              containerStyles="m-6"
              textStyles="text-white px-2 p-2"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditGroup;
