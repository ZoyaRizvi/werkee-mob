import React, { useState, useEffect } from "react";
import {
  FlatList,
  TextInput,
  Button,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import {
  collection,
  query,
  where,
  or,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/authContext/";
import { db, auth } from "../../firebase/firebase";

const Chat = () => {
  const [uniqueChatList, setUniqueChatList] = useState([]);
  const [uniqueUsersList, setUniqueUsersList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages1, setMessages1] = useState([]);
  const [messages2, setMessages2] = useState([]);
  const [messages3, setMessages3] = useState([]);
  const [newMessagePost, setNewMessagePost] = useState("");
  const [recruiter, setRecruiter] = useState(null);
  const [jobTitle, setJobTitle] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility
  const [recipientEmail, setRecipientEmail] = useState(""); // Email of selected user for new message

  const currentUserEmail = auth.currentUser?.email;

  if (!currentUserEmail) {
    return <Text style={styles.loadingText}>Loading user data...</Text>;
  }

  // Fetch user chats
  useEffect(() => {
    if (!currentUserEmail) return;

    const q = query(
      collection(db, "messages"),
      or(
        where("from", "==", currentUserEmail),
        where("to", "==", currentUserEmail)
      ),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.flatMap((doc) => {
        const data = doc.data();
        return [data.from, data.to];
      });
      setUniqueChatList([...new Set(chatList.filter((email) => email !== currentUserEmail))]);
    });

    return () => unsubscribe();
  }, [currentUserEmail]);

  // Fetch unique users
  useEffect(() => {
    if (uniqueChatList.length === 0) return;

    const q = query(
      collection(db, "users"),
      where("email", "in", uniqueChatList),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUniqueUsersList(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [uniqueChatList]);

  // Fetch messages between the selected chat and current user
  useEffect(() => {
    if (!selectedChat) return;

    const q1 = query(
      collection(db, "messages"),
      where("from", "==", currentUserEmail),
      where("to", "==", selectedChat.email),
      orderBy("timestamp")
    );

    const q2 = query(
      collection(db, "messages"),
      where("from", "==", selectedChat.email),
      where("to", "==", currentUserEmail),
      orderBy("timestamp")
    );

    const unsubscribe1 = onSnapshot(q1, (snapshot) => {
      setMessages1(snapshot.docs.map((doc) => doc.data()));
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      setMessages2(snapshot.docs.map((doc) => doc.data()));
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [selectedChat, currentUserEmail]);

  // Combine and sort messages
  useEffect(() => {
    const combined = [...messages1, ...messages2];
    combined.sort((a, b) => a.timestamp - b.timestamp);
    setMessages3(combined);
  }, [messages1, messages2]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await addDoc(collection(db, "messages"), {
        from: currentUserEmail,
        to: selectedChat.email,
        users: [currentUserEmail, selectedChat.email],
        text: newMessage,
        timestamp: Timestamp.now(),
      });
      setNewMessage("");
    }
  };

  const handleNewSendMessage = async () => {
    if (newMessagePost.trim()) {
      await addDoc(collection(db, "messages"), {
        from: currentUserEmail,
        to: recruiter,
        users: [currentUserEmail, recruiter],
        text: `New message for job: ${jobTitle} from ${currentUserEmail}`,
        timestamp: Timestamp.now(),
      });

      await addDoc(collection(db, "messages"), {
        from: currentUserEmail,
        to: recruiter,
        users: [currentUserEmail, recruiter],
        text: newMessagePost,
        timestamp: Timestamp.now(),
      });

      setNewMessagePost("");
    }
  };

  const handleSelectUser = (userEmail) => {
    setRecipientEmail(userEmail);
    setModalVisible(true);
  };

  const handleSendNewMessage = async () => {
    if (recipientEmail && newMessage.trim()) {
      await addDoc(collection(db, "messages"), {
        from: currentUserEmail,
        to: recipientEmail,
        users: [currentUserEmail, recipientEmail],
        text: newMessage,
        timestamp: Timestamp.now(),
      });
      setNewMessage(""); // Clear message input
      setModalVisible(false); // Close modal
    }
  };

  const filteredChats = uniqueUsersList.filter((chat) =>
    chat.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.plusButton}
        onPress={() => setModalVisible(true)}
      >
        <PlusIcon style={styles.plusIcon} />
      </TouchableOpacity>

      {!selectedChat ? (
        <>
          <TextInput
            placeholder="Search chats"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            style={styles.searchInput}
          />
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.email}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.chatItem}
                onPress={() => setSelectedChat(item)}
              >
                <Text style={styles.chatText}>{item.displayName}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <>
          <FlatList
            data={messages3}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.messagesContainer}
            renderItem={({ item }) => (
              <View
                style={
                  item.from === currentUserEmail
                    ? styles.sentMessage
                    : styles.receivedMessage
                }
              >
                <Text style={item.from === currentUserEmail ? styles.sentMessageText : styles.receivedMessageText}>
                  {item.text}
                </Text>
              </View>
            )}
          />
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Type a message"
              value={newMessage}
              onChangeText={(text) => setNewMessage(text)}
              style={styles.messageInput}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedChat(null)}
          >
            <Text style={styles.backButtonText}>Back to Chats</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal for selecting user to message */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Type email of recipient"
              value={recipientEmail}
              onChangeText={(text) => setRecipientEmail(text)}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Type a message"
              value={newMessage}
              onChangeText={(text) => setNewMessage(text)}
              style={styles.modalInput}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendNewMessage}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  plusButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 50,
    elevation: 3,
  },
  plusIcon: {
    color: "#fff",
    width: 24,
    height: 24,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#555",
  },
  searchInput: {
    margin: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 5,
    elevation: 2,
  },
  chatText: {
    fontSize: 16,
    color: "#333",
  },
  messagesContainer: {
    padding: 10,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sentMessageText: {
    color: "#fff",
    fontSize: 15,
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#2196f3",
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  receivedMessageText: {
    color: "#fff",
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#ffffff",
  },
  messageInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#4caf50",
    borderRadius: 25,
    elevation: 3,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    padding: 15,
    backgroundColor: "#f44336",
    alignItems: "center",
    borderRadius: 25,
    margin: 10,
    elevation: 3,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    backgroundColor: "#fff",
    marginBottom: 10,
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#f44336",
    borderRadius: 25,
    elevation: 3,
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Chat;
