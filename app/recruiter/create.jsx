import React, { useState, useEffect } from "react";
import {
  FlatList,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
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
import { db, auth } from "../../firebase/firebase";

const Chat = () => {
  const [uniqueChatList, setUniqueChatList] = useState([]);
  const [uniqueUsersList, setUniqueUsersList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [recruiter, setRecruiter] = useState("");
  const [newMessagePost, setNewMessagePost] = useState("");
  const currentUserEmail = auth.currentUser?.email;

  const handleModalToggle = () => setModalVisible(!modalVisible);

  const handleNewSendMessage = async () => {
    if (recruiter.trim() && newMessagePost.trim()) {
      await addDoc(collection(db, "messages"), {
        from: currentUserEmail,
        to: recruiter,
        text: newMessagePost,
        timestamp: Timestamp.now(),
      });

      // Update the chat list immediately
      if (!uniqueChatList.includes(recruiter)) {
        setUniqueChatList((prevList) => Array.from(new Set([...prevList, recruiter])));
      }

      setRecruiter("");
      setNewMessagePost("");
      setModalVisible(false);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await addDoc(collection(db, "messages"), {
        from: currentUserEmail,
        to: selectedChat.email,
        text: newMessage,
        timestamp: Timestamp.now(),
      });
      setNewMessage("");
    }
  };

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

  useEffect(() => {
    if (uniqueChatList.length === 0) return;

    const q = query(
      collection(db, "users"),
      where("email", "in", uniqueChatList)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUniqueUsersList(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [uniqueChatList]);

  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, "messages"),
      where("from", "in", [currentUserEmail, selectedChat.email]),
      where("to", "in", [currentUserEmail, selectedChat.email]),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [selectedChat, currentUserEmail]);

  const filteredChats = uniqueUsersList.filter((chat) =>
    chat.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {!selectedChat ? (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search chats"
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.iconButton} onPress={handleModalToggle}>
              <Icon name="add" size={24} color="#4caf50" />
            </TouchableOpacity>
          </View>
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
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleModalToggle}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Start a new conversation</Text>
                <TextInput
                  placeholder="Worker's email"
                  value={recruiter}
                  onChangeText={setRecruiter}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Type your message"
                  value={newMessagePost}
                  onChangeText={setNewMessagePost}
                  style={styles.input}
                  multiline
                />
                <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleModalToggle}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleNewSendMessage}
                  >
                    <Text style={styles.buttonText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <>
          <FlatList
            data={messages}
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
                <Text
                  style={
                    item.from === currentUserEmail
                      ? styles.sentMessageText
                      : styles.receivedMessageText
                  }
                >
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 25,
    backgroundColor: "#ffffff",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chatItem: {
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chatText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9fafb",
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#10b981",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  messagesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "75%",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "75%",
  },
  sentMessageText: {
    color: "#ffffff",
    fontSize: 16,
  },
  receivedMessageText: {
    color: "#1f2937",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    borderRadius: 25,
  },
  sendButton: {
    padding: 10,
    backgroundColor: "#10b981",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  backButton: {
    alignSelf: "center",
    padding: 10,
    backgroundColor: "#6b7280",
    borderRadius: 25,
    marginTop: 10,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
}); 

export default Chat;
