import { View, Text, ScrollView, Image, Alert, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from 'react';
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";
import { images } from "../../constants";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Firestore import

const auth = getAuth();
const db = getFirestore();

const RoundButton = ({ title, isSelected, onPress }) => (
  <TouchableOpacity 
    style={[styles.roundButton, isSelected && styles.selectedButton]} 
    onPress={onPress}
  >
    <Text style={[styles.buttonText, isSelected && styles.selectedButtonText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const SignUp = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [role, setRole] = useState(''); 
  const [showForm, setShowForm] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(''); // Error handling
  const router = useRouter();

  const submit = async () => {
    if (form.email === "" || form.password === "" || form.confirmPassword === "" || form.name === "" || role === '') {
      Alert.alert("Error", "Please fill in all fields and select a role");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      // Create user with email and password in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, { displayName: form.name });

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: form.name,
        role: role,
        createdAt: new Date(),
      });

      // Registration successful
      Alert.alert("Success", "User registered successfully");
      router.replace("/sign-in");

    } catch (error) {
      // Catch and show any Firebase errors
      setErrorMessage(error.message);
      Alert.alert("Error", error.message);
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

          {!showForm ? (
            <>
              <Text style={styles.welcomeText}>
                Welcome to Werky,{'\n'}Let’s kickstart your career journey together!
              </Text>

              <Text style={styles.joinAsText}>
                Join as
              </Text>

              <View style={styles.buttonGroup}>
                <RoundButton 
                  title="Worker" 
                  isSelected={role === 'worker'} 
                  onPress={() => { setRole('worker'); setShowForm(true); }}
                />
                <RoundButton 
                  title="Recruiter" 
                  isSelected={role === 'recruiter'} 
                  onPress={() => { setRole('recruiter'); setShowForm(true); }}
                />
              </View>
            </>
          ) : (
            <>
              <FormField
                title="Full Name"
                value={form.name}
                handleChangeText={(e) => setForm({ ...form, name: e })}
                otherStyles="mt-3"
                placeholder="Enter your full name"
              />

              <FormField
                title="Email"
                value={form.email}
                handleChangeText={(e) => setForm({ ...form, email: e })}
                otherStyles="mt-3"
                keyboardType="email-address"
                placeholder="Enter your email"
              />

              <FormField
                title="Password"
                value={form.password}
                handleChangeText={(e) => setForm({ ...form, password: e })}
                otherStyles="mt-3"
                placeholder="Enter your password"
                secureTextEntry
              />

              <FormField
                title="Confirm Password"
                value={form.confirmPassword}
                handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
                otherStyles="mt-3"
                placeholder="Confirm your password"
                secureTextEntry
              />

              {errorMessage ? (
                <Text style={{ color: 'red', textAlign: 'center', marginVertical: 10 }}>
                  {errorMessage}
                </Text>
              ) : null}

              <CustomButton
                title="Sign Up"
                handlePress={submit}
                containerStyles={{ marginBottom: 20 }}
                isLoading={isSubmitting}
              />
            </>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#666' }}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#007bff', marginLeft: 8 }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  joinAsText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roundButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  selectedButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    fontSize: 16,
    color: '#666',
  },
  selectedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SignUp;
