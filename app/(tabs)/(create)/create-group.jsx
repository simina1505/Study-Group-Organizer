import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  // Alert,
  // Switch,
} from "react-native";
// import React from "react";
// import FormField from "../../../components/FormField";
// import { useState } from "react";
// import CustomButton from "../../../components/CustomButton";
// import { router } from "expo-router";
// import axios from "axios";
// import { MultipleSelectList } from "react-native-dropdown-select-list";
// import AsyncStorage from "@react-native-async-storage/async-storage";

const CreateGroup = () => {
  // const { setUser, setIsLogged } = useGlobalContext();

  // const subjectsList = [
  //   { key: "1", value: "Math" },
  //   { key: "2", value: "Science" },
  //   { key: "3", value: "History" },
  //   { key: "4", value: "Art" },
  //   { key: "5", value: "Computer Science" },
  // ];
  // const [subjects, setSelected] = useState([]);
  // const [isSubmiting, setIsSubmiting] = useState(false);
  // const [form, setForm] = useState({
  //   name: "",
  //   description: "",
  //   privacy: "Public",
  // });

  // const getLoggedUser = async () => {
  //   try {
  //     const loggedUser = await AsyncStorage.getItem("loggedUser"); //username-ul
  //     if (loggedUser) {
  //       return loggedUser;
  //     }
  //     return null;
  //   } catch (error) {
  //     console.error("Error retrieving loggedUser:", error);
  //   }
  // };

  // const togglePrivacy = () => {
  //   setForm((prevForm) => ({
  //     ...prevForm,
  //     privacy: prevForm.privacy === "Public" ? "Private" : "Public",
  //   }));
  // };

  // const submit = async () => {
  //   if (!form.name) {
  //     Alert.alert("Error", "Please enter group name");
  //   }
  //   if (!form.description) {
  //     Alert.alert("Error", "Please enter description");
  //   }
  //   if (subjects.length == 0) {
  //     Alert.alert("Error", "Please pick a least one subject");
  //   }

  //   setIsSubmiting(true);
  //   const group = {
  //     name: form.name,
  //     description: form.description,
  //     subject: subjects,
  //     privacy: form.privacy,
  //     creator: await getLoggedUser(),
  //   };
  //   axios
  //     .post("http://192.168.0.101:8000/createGroup", group)
  //     .then((response) => {
  //       Alert.alert("Success", response.data);
  //       router.replace("/home-page");
  //     })
  //     .catch((error) => {
  //       console.log("group creation error:", error);
  //       Alert.alert("Error", error.message);
  //     });
  //   setIsSubmiting(false);
  // };
  return (
    <SafeAreaView className=" h-full">
      <ScrollView>
        <View className="w-full justify-center px-4 my-6 ">
          <Text className="mx-6 mb-6 text-xl">Create Group </Text>
          {/* <FormField
            title="Group Name"
            value={form.name}
            handleChangeText={(e) => setForm({ ...form, name: e })}
            otherStyles="mx-6"
            keyboardType="group-name"
            placeholder="type group name"
          />
          <FormField
            title="Description"
            value={form.description}
            handleChangeText={(e) => setForm({ ...form, description: e })}
            otherStyles="mx-6 mb-4"
            placeholder="type a description"
          />

          <View className="mx-6 mb-4">
            <MultipleSelectList
              setSelected={(val) => setSelected(val)}
              data={subjectsList}
              label="Subjects"
              save="value"
              notFoundText="No subject exists"
            />
          </View>

          <View className="flex-row items-center mx-6 mb-4">
            <Text className="text-lg mr-2">{form.privacy}</Text>
            <Switch
              value={form.privacy === "Private"}
              onValueChange={togglePrivacy}
            />
          </View>

          <CustomButton
            title="Create"
            handlePress={submit}
            containerStyles="m-6"
            isLoading={isSubmiting}
            textStyles="text-white px-2 p-2"
          /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateGroup;
