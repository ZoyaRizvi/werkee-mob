import React from 'react';
import { Redirect, router } from "expo-router";
import { Text, View, ScrollView, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import CustomButton from '../components/CustomButton';
import Councellor from './screens/councellor';
import SkillAssessmentScreen from './screens/SkillAssessmentScreen3';

export default function App() {
  return (
    <SafeAreaView className="bg-primary flex-1">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
      
        <View className="w-full flex justify-center items-center px-4">
          <Image
            source={images.logo}
            className="w-[190px] h-[84px] rounded-lg shadow-lg"
            resizeMode="contain"
          />
          <Image
            source={images.cards}
            className="max-w-[380px] w-full h-[298px] rounded-lg shadow-lg mt-5"
            resizeMode="contain"
          />

          <View className="relative mt-5">
            <Text className="text-3xl text-gray font-bold text-center">
              <Text className="text-teal-500">Earn</Text> your first income{"\n"}
              with{" "}
              <Text className="text-secondary-200">Werkee</Text>
            </Text>

            <Text className="text-sm font-pregular text-gray mt-7 text-center">
              Real projects, real earnings—smart opportunities for the smart generation.
            </Text>
            <CustomButton
              title="Get Started"
              handlePress={() => router.push("/sign-in")}
              containerStyles="w-full mt-7"
            />
          </View>
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
}
