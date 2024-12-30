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
  FlatList,
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
import QRCode from "react-native-qrcode-svg";

const GroupPage = () => {
  const { groupId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState("");
  const [messages, setMessages] = useState([]);
  const [loggedUserId, setLoggedUserId] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false); // State to control modal visibility
  const [selectedImage, setSelectedImage] = useState(null);
  const [requestsModalVisible, setModalVisible] = useState(false);
  const [qrCodeModalVisible, setQRCodeModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        await getLoggedUser();
        await fetchGroupData();
        await fetchMessagesAndFiles();
      };

      fetchData();
    }, [groupId])
  );

  const openCreateGroupForm = () => {
    router.push(`/create-session?groupId=${groupId}`);
  };

  const getLoggedUser = async () => {
    try {
      const userId = await AsyncStorage.getItem("loggedUserId");
      const username = await AsyncStorage.getItem("loggedUser");
      if (userId) {
        setLoggedUserId(userId);
      }
      if (username) {
        setLoggedUser(username);
      }
    } catch (error) {
      console.error("Error retrieving loggedUserId:", error);
    }
  };

  const fetchMessagesAndFiles = async () => {
    try {
      const response = await axios.get(
        `http://172.20.10.5:8000/fetchMessagesandFiles/${groupId}`
      );
      if (response.data.success) {
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

  const handleAccept = async (username) => {
    try {
      const response = await axios.post(
        "http://172.20.10.5:8000/acceptRequest",
        { groupId, username }
      );
      if (response.data.success) {
        const updatedRequests = selectedGroup.requests.filter(
          (request) => request !== username
        );
        const updatedGroup = { ...selectedGroup, requests: updatedRequests };

        setSelectedGroup(updatedGroup);
        Alert.alert("Success", `${username} added to group!`);
      }
    } catch (error) {
      console.error("Error fetching group:", error);
      Alert.alert("Error", "Failed to fetch group.");
    }
  };

  const handleDecline = async (username) => {
    try {
      const response = await axios.post(
        "http://172.20.10.5:8000/declineRequest",
        { groupId, username }
      );
      if (response.data.success) {
        const updatedRequests = selectedGroup.requests.filter(
          (request) => request !== username
        );
        const updatedGroup = { ...selectedGroup, requests: updatedRequests };

        setSelectedGroup(updatedGroup);
        Alert.alert("Success", `${username} removed from requests!`);
      }
    } catch (error) {
      console.error("Error fetching group:", error);
      Alert.alert("Error", "Failed to fetch group.");
    }
  };

  const selectAndUploadPhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission to access media library is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType,
        quality: 1,
      });

      if (!result.canceled) {
        const photo = result.assets[0];

        if (!photo) {
          console.error("No photo selected");
          return;
        }

        const { uri, mimeType } = photo;
        const name = `Photo - ${Date.now()}.png`;

        if (!uri || !mimeType) {
          console.error("Missing photo properties: ", { uri, name, mimeType });
          return;
        }

        const photoMessage = {
          _id: uuidv4(),
          text: name,
          createdAt: new Date(),
          user: { _id: loggedUserId },
          file: { uri, name, mimeType },
        };
        setSelectedFile(photoMessage);
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
        const downloadResponse = await axios.get(
          `http://172.20.10.5:8000/downloadById/${fileId}`,
          { responseType: "arraybuffer" }
        );
        const base64Data = arrayBufferToBase64(downloadResponse.data);
        const fileUri = FileSystem.documentDirectory + fileNameFromMetadata;
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
    return window.btoa(binary);
  }

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  const fetchGroupData = async () => {
    try {
      const response = await axios.get(
        `http://172.20.10.5:8000/fetchGroup/${groupId}`
      );
      if (response.data.success) {
        setSelectedGroup(response.data.group);
      }
    } catch (error) {
      console.error("Error fetching group:", error);
      Alert.alert("Error", "Failed to fetch group.");
    }
  };

  const openRequestsModal = async () => {
    if (selectedGroup) {
      setModalVisible(true);
    }
  };

  const generateQRCode = async () => {
    try {
      const username = loggedUser;
      const response = await axios.post(
        "http://172.20.10.5:8000/generateGroupQRCode",
        {
          groupId,
          username,
        }
      );
      setQrCodeData(response.data.qrCode);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const openQRCodeModal = async () => {
    setQRCodeModalVisible(true);
    await generateQRCode();
  };

  const closeQRCodeModal = () => {
    setQRCodeModalVisible(false);
  };

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
        {
          <TouchableOpacity
            onPress={selectAndUploadPhoto}
            style={{ margin: 10 }}>
            <Text style={{ color: "blue" }}>
              <FontAwesome size={25} name="photo" />
            </Text>
          </TouchableOpacity>
        }
      </View>
    </View>
  );

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
      <View
        className="flex-row"
        style={{ alignItems: "center", marginBottom: 20 }}>
        <CustomButton
          title="Create Session"
          handlePress={openCreateGroupForm}
          containerStyles="m-6"
          textStyles="text-white px-2 p-2"
        />
        {selectedGroup?.creator === loggedUser && (
          <View className="flex-row">
            <CustomButton
              title="Requests"
              handlePress={openRequestsModal}
              containerStyles="m-6"
              textStyles="text-white px-2 p-2"
            />
            {selectedGroup.privacy === "Private" && (
              <CustomButton
                title="QR Code"
                handlePress={openQRCodeModal}
                containerStyles="m-6"
                textStyles="text-white px-2 p-2"
              />
            )}
          </View>
        )}
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

      <Modal visible={requestsModalVisible} animationType="slide" transparent>
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
            {selectedGroup && selectedGroup.requests.length > 0 ? (
              <FlatList
                data={selectedGroup.requests}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      paddingVertical: 8,
                    }}>
                    <Text style={{ fontSize: 16, color: "#333" }}>{item}</Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <TouchableOpacity
                        onPress={() => handleAccept(item)}
                        style={{
                          backgroundColor: "green",
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 5,
                        }}>
                        <Text style={{ color: "white" }}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDecline(item)}
                        style={{
                          backgroundColor: "red",
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 5,
                        }}>
                        <Text style={{ color: "white" }}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                style={{ marginTop: 16, width: "100%" }}
              />
            ) : (
              <Text style={{ marginTop: 16, color: "#333" }}>
                No requests found
              </Text>
            )}

            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <CustomButton
                title="Close"
                handlePress={() => setModalVisible(false)}
                containerStyles="w-30"
                textStyles="text-white px-2 p-2"
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={qrCodeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeQRCodeModal}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}>
          <TouchableOpacity
            onPress={closeQRCodeModal}
            style={{ position: "absolute", top: 40, right: 20 }}>
            <FontAwesome size={30} name="close" color="white" />
          </TouchableOpacity>
          <View>
            {qrCodeData ? (
              <QRCode value={qrCodeData} size={200} />
            ) : (
              <Text>Generating QR Code...</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GroupPage;
