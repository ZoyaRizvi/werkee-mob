import { View, Text, Button } from "react-native";
import React from 'react';
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useRouter } from "expo-router";

export function LogOut() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/sign-in");
    } catch (err) {
      console.error("Error signing out: ", err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Are you sure you want to log out?
      </Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
}

export default LogOut;
