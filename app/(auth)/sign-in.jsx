import { View, Text, ScrollView, Image, Alert, TouchableOpacity } from "react-native";
import React, { useState } from 'react';
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";
import { images } from "../../constants";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";  // Firebase auth import
import { auth } from "../../firebase/firebase";  // Firebase configuration import

const SignIn = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSubmitting(true);
    setErrorMessage(""); // Reset error message

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      Alert.alert("Success", "Signed in successfully");
      router.replace("/home");
    } catch (error) {
      setErrorMessage(`Auth Error: ${error.code}`);
      Alert.alert("Error", `Authentication failed: ${error.code}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={{ width: '100%', maxWidth: 400 }}>
          <Image
            source={images.logo}
            resizeMode="contain"
            style={{ width: 190, height: 84, alignSelf: 'center', marginBottom: 20 }}
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
            placeholder="Enter your email"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            placeholder="Enter your password"
          />

          {errorMessage ? (
            <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
              {errorMessage}
            </Text>
          ) : null}

          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles={{ marginBottom: 20 }}
            isLoading={isSubmitting}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#666' }}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/sign-up")}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#007bff', marginLeft: 8 }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
