import { View, Text, ScrollView, Image, Alert, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from 'react';
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";
import { images } from "../../constants";
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebase"; // Ensure Firestore is imported
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

export function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async () => {
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch the user's role from Firestore
        const userDocRef = doc(db, "users", user.uid); // Assuming user roles are stored in Firestore under a "users" collection
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role; // Assuming 'role' field contains the role

          // Redirect based on the user's role
          if (userRole === 'admin') {
            router.push("/admin/home");
          } else if (userRole === 'candidate') {
            router.push("/candidate/home");
          } else if (userRole === 'recruiter') {
            router.push("/recruiter/home");
          } else {
            throw new Error("Unknown user role");
          }
        } else {
          throw new Error("User document not found");
        }

      } catch (err) {
        setErrorMessage(`Auth Error: ${err.message}`);
        setIsSigningIn(false);
      }
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
            value={email}
            handleChangeText={setEmail}
            otherStyles="mt-7"
            keyboardType="email-address"
            placeholder="Enter your email"
          />

          <FormField
            title="Password"
            value={password}
            handleChangeText={setPassword}
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
            handlePress={onSubmit}
            containerStyles={{ marginBottom: 20 }}
            isLoading={isSigningIn}
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
}

export default SignIn;
