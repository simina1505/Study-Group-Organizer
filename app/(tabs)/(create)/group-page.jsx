import { useLocalSearchParams, router } from "expo-router";
import {
  SafeAreaView,
  Text,
  View,
  Alert,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import CustomButton from "../../../components/CustomButton";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GiftedChat } from "react-native-gifted-chat";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { v4 as uuidv4 } from "uuid";
import { useFocusEffect } from "@react-navigation/native";

const GroupPage = () => {
  const { groupId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState("");
  const [messages, setMessages] = useState([]);
  const [loggedUserId, setLoggedUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      getLoggedUser();
      fetchMessagesAndFiles();
    }, [groupId])
  );

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
        console.log(response.data.messages);
        const allMessages = response.data.messages.map((msg) => ({
          _id: msg._id,
          text: msg.content || msg.text,
          createdAt: new Date(msg.timestamp),
          user: {
            _id: msg.senderId || msg.user._id,
          },
          file: msg.file ? msg.file : null,
        }));

        setMessages(allMessages.reverse());
        //console.log("hei");
        //console.log(messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to load messages.");
    }
  };

  const onSend = useCallback(
    async (messagesArray = []) => {
      const message = messagesArray[0];
      try {
        if (message.file) {
          // Handle file message
          const formData = new FormData();
          formData.append("file", {
            uri: message.file.uri,
            name: message.file.name,
            type: message.file.type,
          });
          formData.append("senderId", loggedUserId);
          formData.append("groupId", groupId);

          const response = await axios.post(
            "http://172.20.10.5:8000/sendFile",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          // Assuming backend returns file URL or fileId
          if (response.data.success) {
            // Add the fileUrl or other metadata to the message
            const fileMessage = {
              _id: uuidv4(),
              text: `File: ${message.file.name}`,
              createdAt: new Date(),
              user: { _id: loggedUserId },
              file: { url: response.data.fileUrl, name: message.file.name },
            };
            setMessages((prevMessages) =>
              GiftedChat.append(prevMessages, [fileMessage])
            );
          }
        } else {
          // Handle text message
          await axios.post("http://172.20.10.5:8000/sendMessage", {
            senderId: loggedUserId,
            groupId,
            content: message.text,
          });

          setMessages((prevMessages) =>
            GiftedChat.append(prevMessages, messagesArray)
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [groupId, loggedUserId]
  );

  const handleFileSelect = async () => {
    try {
      // Open the document picker
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });

      // Check if the user canceled the document picker
      if (!result.canceled) {
        // Log the full result for debugging
        //
        //  console.log("Document picker result:", result);

        // Access the first file asset in the result
        const file = result.assets[0]; // Get the first file in the assets array

        // Check if the file object is properly populated
        if (!file) {
          console.error("No file selected");
          return;
        }

        // Extract file details from the file object
        const { uri, name, mimeType } = file;

        // If the file object is missing properties, log them
        if (!uri || !name || !mimeType) {
          console.error("Missing file properties: ", { uri, name, mimeType });
          return;
        }

        // Create a message object with the selected file details
        const fileMessage = {
          _id: uuidv4(), // Generate a unique ID
          text: `File: ${name}`, // Display the file name in the message
          createdAt: new Date(),
          user: { _id: loggedUserId },
          file: { uri, name, mimeType }, // Store the file details
        };

        // Log the fileMessage for debugging
        // console.log("File message:", fileMessage);

        // Optionally set the selected file in the state
        setSelectedFile(fileMessage);

        // Send the file message
        onSend([fileMessage]);
      } else {
        console.log("File picker was canceled.");
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const selectAndUploadPhoto = async () => {
    // Request permissions
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission to access media library is required!");
        return;
      }

      // Open the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType,
        quality: 1, // High-quality image
      });

      if (!result.canceled) {
        // Log the full result for debugging
        //
        //  console.log("Document picker result:", result);

        // Access the first file asset in the result
        const photo = result.assets[0]; // Get the first file in the assets array

        // Check if the file object is properly populated
        if (!photo) {
          console.error("No photo selected");
          return;
        }

        // Extract file details from the file object
        const { uri, mimeType } = photo;
        const name = `Photo - ${Date.now()}.png`;

        // If the file object is missing properties, log them
        if (!uri || !mimeType) {
          console.error("Missing photo properties: ", { uri, name, mimeType });
          return;
        }

        // Create a message object with the selected file details
        const photoMessage = {
          _id: uuidv4(), // Generate a unique ID
          text: name, // Display the file name in the message
          createdAt: new Date(),
          user: { _id: loggedUserId },
          file: { uri, name, mimeType }, // Store the file details
        };

        // Log the fileMessage for debugging
        // console.log("File message:", fileMessage);

        // Optionally set the selected file in the state
        setSelectedFile(photoMessage);

        // Send the file message
        onSend([photoMessage]);
      } else {
        console.log("File picker was canceled.");
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };
  const downloadFile = (fileName) => {
    // console.log(fileName);
    // console.log("hei");
    // axios
    //   .get(`http://172.20.10.5:8000/getFileMetadata/${fileName}`)
    //   .then((response) => {
    //     console.log(response);
    //     if (response.data.success) {
    //       const fileId = response.data.fileId; // Extract fileId from the response
    //       //console.log(fileId);
    //       // Step 2: Download the file using the fileId
    //       axios({
    //         url: `http://172.20.10.5:8000/downloadById/${fileId}`, // Request the file by ID
    //         method: "GET",
    //         responseType: "blob", // Ensure the response is treated as a Blob (file)
    //       })
    //         .then((response) => {
    //           const url = URL.createObjectURL(new Blob([response.data]));
    //           const link = document.createElement("a");
    //           link.href = url;
    //           link.setAttribute("download", response.data.fileName); // Optionally use the filename from response
    //           document.body.appendChild(link);
    //           link.click(); // Trigger download
    //           Alert.alert("Success", "File downloaded successfully!");
    //         })
    //         .catch((error) => {
    //           console.error("Error downloading file:", error);
    //         });
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error retrieving file metadata:", error);
    //   });
  };
  // Render custom actions for file upload
  const renderActions = () => (
    <View className="flex-row">
      <View>
        <TouchableOpacity onPress={handleFileSelect} style={{ margin: 10 }}>
          <Text style={{ color: "blue" }}>
            <FontAwesome size={25} name="paperclip" />
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={selectAndUploadPhoto} style={{ margin: 10 }}>
          <Text style={{ color: "blue" }}>
            <FontAwesome size={25} name="photo" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render message bubbles
  const renderMessageText = (props) => {
    const { currentMessage } = props;
    console.log(currentMessage);
    if (currentMessage.file && currentMessage.file.name) {
      const url = currentMessage.file.name; // Convert to lowercase for case-insensitive matching
      console.log("intra?");
      const isImage =
        url.includes(".png") ||
        url.includes(".jpeg") ||
        url.includes(".jpg") ||
        url.includes(".gif");

      if (isImage) {
        return (
          <Image
            source={{
              uri: `http://172.20.10.5:8000/getImage/${currentMessage.file.name}`,
            }}
            style={{ width: 200, height: 200 }}
          />
        );
      } else {
        return (
          <TouchableOpacity
            key={currentMessage.id}
            onPress={() => {
              downloadFile(currentMessage.file.name);
            }}>
            <Text className="px-2 py-1 text-white underline">
              {currentMessage.file.name}
            </Text>
          </TouchableOpacity>
        );
      }
    }

    return <Text className="px-2 py-1 text-white">{currentMessage.text}</Text>;
  };
  return (
    <View style={{ flex: 1, marginTop: 40 }}>
      <Text style={{ textAlign: "center", fontSize: 16, marginVertical: 10 }}>
        Group ID: {groupId}
      </Text>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <CustomButton
          title="Create Session"
          handlePress={openCreateGroupForm}
          containerStyles="m-6"
          textStyles="text-white px-2 p-2"
        />
      </View>

      {/* GiftedChat */}
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{ _id: loggedUserId }}
        renderActions={renderActions}
        renderMessageText={renderMessageText}
      />
    </View>
  );
};

export default GroupPage;
