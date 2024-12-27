import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView, Text, View, Alert, TextInput } from "react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import CustomButton from "../../../components/CustomButton";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GiftedChat } from "react-native-gifted-chat";
import { v4 as uuidv4 } from "uuid";

const GroupPage = () => {
  const { groupId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState("");
  const [messages, setMessages] = useState([]);
  const [loggedUserId, setLoggedUser] = useState(null);

  useEffect(() => {
    fetchMessagesAndFiles();
    getLoggedUser();
  }, [groupId]);

  const openCreateGroupForm = () => {
    router.push(`/create-session?groupId=${groupId}`);
  };

  const getLoggedUser = async () => {
    try {
      const userId = await AsyncStorage.getItem("loggedUserId");
      if (userId) {
        setLoggedUser(userId);
      }
    } catch (error) {
      console.error("Error retrieving loggedUserId:", error);
    }
  };

  const fetchMessagesAndFiles = async () => {
    //sf console.log(file);
    try {
      const response = await axios.get(
        `http://172.20.10.5:8000/fetchMessagesandFiles/${groupId}`
      );
      // console.log("Response Data:", response.data);
      if (response.data.success) {
        const messages = response.data.messages.map((msg) => ({
          _id: msg._id,
          text: msg.content,
          createdAt: new Date(msg.timestamp),
          user: {
            _id: msg.senderId,
            name: msg.senderId == loggedUserId ? "You" : "none", // Assuming the sender's name is provided
          },
          file: msg.fileName || null,
        }));
        setMessages(messages.reverse());
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to load messages.");
    }
  };

  const onSend = async (messagesArray = []) => {
    const message = messagesArray[0];
    const newMessage = {
      _id: uuidv4(),
      text: message.text,
      createdAt: new Date(),
      user: { _id: loggedUserId, name: "You" },
    };
    const success = await sendMessageToBackend(message.text);
    if (success) {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [newMessage])
      );
      setMessage("");
    }
  };

  const sendMessageToBackend = async (messageText) => {
    try {
      const response = await axios.post("http://172.20.10.5:8000/sendMessage", {
        senderId: loggedUserId,
        groupId,
        content: messageText,
      });
      return response.data.success;
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "There was an error sending your message.");
      return false;
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (result) {
        setFile(result.assets[0].uri);
        const messageContent = {
          _id: uuidv4(),
          text: `File: ${result.assets[0].name}`,
          createdAt: new Date(),
          user: { _id: loggedUserId, name: "You" },
          file: result,
        };
        setMessage("");
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [messageContent])
        );
      }
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Error", "There was an error picking the file.");
    }
  };

  //SEND MESSAGE
  const uploadFileAndSendMessage = async () => {
    if (!loggedUserId) {
      Alert.alert("Error", "User not logged in.");
      return;
    }
    if (!file) {
      Alert.alert("No file selected", "Please select a file before uploading.");
      return;
    }
    const formData = new FormData();
    formData.append("file", {
      uri: file,
      name: file.split("/").pop(),
      type: "application/octet-stream",
    });

    formData.append("senderId", loggedUserId);
    formData.append("groupId", groupId);
    formData.append("content", message || "File message");

    try {
      const response = await axios.post(
        "http://172.20.10.5:8000/uploadFile",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        const uploadedMessage = {
          _id: uuidv4(),
          text: `File: ${response.data.message.content}`,
          createdAt: new Date(),
          user: { _id: loggedUserId, name: "You" },
          file: response.data.file, // Attach the file info here
        };

        setMessages((prevMessages) => [...prevMessages, uploadedMessage]);
        setFile(null);
        setMessage("");
      }
    } catch (error) {
      console.error("Error uploading file and sending message:", error);
      Alert.alert("Upload failed", "There was an error uploading the file.");
    }
  };

  const renderMessage = (props) => {
    const { currentMessage } = props;
    //console.log(currentMessage);
    if (currentMessage.File) {
      return (
        <View style={{ margin: 10 }}>
          <Text style={{ color: "blue" }}>
            File: {currentMessage.text || "Unnamed file"}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={{ margin: 10 }}>
          <Text>{currentMessage.text}</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>Group ID: {groupId}</Text>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <CustomButton
          title="Create Session"
          handlePress={openCreateGroupForm}
          containerStyles="m-6"
          textStyles="text-white px-2 p-2"
        />
      </View>

      <GiftedChat
        messages={messages}
        onSend={(messages) => {
          onSend(messages); // Reset message input after send
        }}
        user={{ _id: loggedUserId }}
        renderInputToolbar={(props) => (
          <View
            className="flex-row"
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              borderTopWidth: 1,
              borderColor: "#ccc",
            }}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder=" Enter message"
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
                margin: 2,
                borderRadius: 10,
                borderWidth: 1,
                paddingHorizontal: 10,
                width: 200,
              }}
            />
            <CustomButton
              title="Send"
              handlePress={() =>
                onSend([
                  {
                    _id: uuidv4(),
                    text: message,
                    createdAt: new Date(),
                    user: { _id: loggedUserId, name: "You" },
                  },
                ])
              }
              textStyles="text-white px-2 p-2"
            />
            <CustomButton
              title="Pick file"
              handlePress={pickFile}
              textStyles="text-white px-2 p-2"
            />
            {/* File Preview Section */}
            {file && (
              <View
                style={{
                  padding: 10,
                  marginBottom: 10,
                  backgroundColor: "#f8f8f8",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#ccc",
                }}>
                <Text style={{ fontSize: 16 }}>Selected File:</Text>
                <Text>{file.name}</Text>
                <CustomButton
                  title="Send File"
                  handlePress={uploadFileAndSendMessage}
                  textStyles="text-white px-2 p-2"
                />
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default GroupPage;
