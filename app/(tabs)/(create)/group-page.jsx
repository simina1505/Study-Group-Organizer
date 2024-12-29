import { useLocalSearchParams, router } from "expo-router";
import {
  SafeAreaView,
  Text,
  View,
  Alert,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
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
import * as FileSystem from "expo-file-system";

const GroupPage = () => {
  const { groupId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState("");
  const [messages, setMessages] = useState([]);
  const [loggedUserId, setLoggedUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false); // State to control modal visibility
  const [selectedImage, setSelectedImage] = useState(null);

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
        // console.log(response.data.messages);
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
  const downloadFile = async (fileName) => {
    try {
      const metadataResponse = await axios.get(
        `http://172.20.10.5:8000/getFileMetadata/${fileName}`
      );

      if (metadataResponse.data.success) {
        const fileId = metadataResponse.data.fileId;
        const fileNameFromMetadata = metadataResponse.data.fileName || fileName;
        console.log(metadataResponse.data);
        const downloadResponse = await axios.get(
          `http://172.20.10.5:8000/downloadById/${fileId}`,
          { responseType: "arraybuffer" }
        );

        // Convert the arraybuffer to Base64 encoding
        const base64Data = arrayBufferToBase64(downloadResponse.data);

        // Define the file path for saving the file
        const fileUri = FileSystem.documentDirectory + fileNameFromMetadata;

        // Save the file using Expo's FileSystem API
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert("Success", "File downloaded successfully!");
      } else {
        Alert.alert("Error", "Failed to fetch file metadata.");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Error", "Failed to download file.");
    }
  };
  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const length = bytes.byteLength;
    for (let i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary); // Convert binary string to Base64
  }

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  // Close the image modal
  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
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

    if (currentMessage.file) {
      const { name } = currentMessage.file;
      const isImage =
        name.toLowerCase().endsWith(".png") ||
        name.toLowerCase().endsWith(".jpeg") ||
        name.toLowerCase().endsWith(".jpg") ||
        name.toLowerCase().endsWith(".gif");

      if (isImage) {
        return (
          <TouchableOpacity
            onPress={() =>
              openImageModal(`http://172.20.10.5:8000/getImageByName/${name}`)
            }>
            <Image
              source={{
                uri: `http://172.20.10.5:8000/getImageByName/${name}`,
              }}
              style={{ width: 200, height: 200 }}
            />
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity onPress={() => downloadFile(name)}>
            <Text className="px-2 py-1 text-white underline">{name}</Text>
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

      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}>
          <TouchableOpacity
            onPress={closeImageModal}
            style={{ position: "absolute", top: 40, right: 20 }}>
            <FontAwesome size={30} name="close" color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={{ width: "90%", height: "80%", resizeMode: "contain" }}
          />
        </View>
      </Modal>
    </View>
  );
};

export default GroupPage;
