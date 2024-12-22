import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { useState } from "react";
import CustomButton from "../../../components/CustomButton";

const GroupPage = () => {
  const { groupId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const openCreateGroupForm = () => {
    router.push(`/create-session?groupId=${groupId}`);
  };
  return (
    <SafeAreaView>
      <ScrollView>
        <Text>Group ID</Text>
        <View className="items-center">
          <CustomButton
            title="Create Session"
            handlePress={openCreateGroupForm}
            containerStyles="m-6 w-40"
            isLoading={isLoading}
            textStyles="text-white px-2 p-2"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GroupPage;
