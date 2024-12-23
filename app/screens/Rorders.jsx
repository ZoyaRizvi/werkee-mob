import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { Picker } from '@react-native-picker/picker';

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db , auth } from "../../firebase/firebase";


export default function ROrders() {
  const dbUser = auth.currentUser;
  const [currentTab, setCurrentTab] = useState("All Offers");
  const [offersData, setOffersData] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);

  const DEFAULT_PROFILE_IMAGE =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUFJ4m3HGM8397IWhGhLphaU38QtqrcYQoUg&s";

  useEffect(() => {
    fetchOffers();
    fetchAcceptedOrders();
  }, [dbUser]);

  const fetchOffers = async () => {
    const offersRef = collection(db, "Offers");
    const q = query(offersRef, where("RecruiterEmail", "==", dbUser.email));

    const querySnapshot = await getDocs(q);
    const offers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setOffersData(offers);
  };

  const fetchAcceptedOrders = async () => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("RecruiterEmail", "==", dbUser.email));

    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setAcceptedOrders(orders);
  };

  const acceptOffer = async (offerId) => {
    try {
      const offerRef = doc(db, "Offers", offerId);
      const offerDoc = await getDoc(offerRef);

      if (offerDoc.exists()) {
        const offerData = offerDoc.data();

        const orderRef = doc(collection(db, "orders"), offerId);
        await setDoc(orderRef, {
          ...offerData,
          status: "Accepted",
          timestamp: new Date().toISOString(),
        });
        setOffersData((prevOffers) => prevOffers.filter((offer) => offer.id !== offerId));

        Alert.alert("Success", "Offer accepted");
        fetchOffers();
        fetchAcceptedOrders();
      } else {
        Alert.alert("Error", "Offer not found!");
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
      Alert.alert("Error", "Failed to accept the offer.");
    }
  };

  const declineOffer = async (offerId) => {
    try {
      const offerRef = doc(db, "Offers", offerId);
      await updateDoc(offerRef, { status: "Declined" });
      setOffersData((prevOffers) => prevOffers.filter((offer) => offer.id !== offerId));
      Alert.alert("Success", "Offer declined successfully!");
      fetchOffers();
    } catch (error) {
      console.error("Error declining offer:", error);
      Alert.alert("Error", "Failed to decline the offer.");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      Alert.alert("Success", `Order status updated to ${newStatus}!`);
      fetchAcceptedOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      Alert.alert("Error", "Failed to update order status.");
    }
  };

  const renderOffer = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text>Description{item.description} </Text>
      <Text>Delivery Time: {item.deliveryTime} days</Text>
      <Text>Revisions: {item.revisions}</Text>
      <Text>Price: ${item.price}</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => acceptOffer(item.id)}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.declineButton]}
          onPress={() => declineOffer(item.id)}
        >
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text>Recruiter's Email: {item.RecruiterEmail}</Text>
      <Text>Price: {item.price}</Text>
      <Text>Status: {item.status}</Text>
      <Picker
        selectedValue={item.status}
        onValueChange={(value) => updateOrderStatus(item.id, value)}
        style={styles.picker}
      >
        <Picker.Item label="Pending" value="Pending" />
        <Picker.Item label="Delivered" value="Delivered" />
        <Picker.Item label="Cancelled" value="Cancelled" />
        <Picker.Item label="Accepted" value="Accepted" />
      </Picker>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Offers</Text>
      </View>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentTab === "All Offers" && styles.activeTab,
          ]}
          onPress={() => setCurrentTab("All Offers")}
        >
          <Text>All Offers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentTab === "Accepted Orders" && styles.activeTab,
          ]}
          onPress={() => setCurrentTab("Accepted Orders")}
        >
          <Text>Accepted Orders</Text>
        </TouchableOpacity>
      </View>
      {currentTab === "All Offers" && (
        <FlatList
          data={offersData}
          renderItem={renderOffer}
          keyExtractor={(item) => item.id}
        />
      )}
      {currentTab === "Accepted Orders" && (
        <FlatList
          data={acceptedOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tabRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#007bff",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: "#28a745",
  },
  declineButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  picker: {
    marginTop: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
});