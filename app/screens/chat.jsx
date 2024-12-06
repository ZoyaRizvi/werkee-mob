import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase"; // Adjust path as necessary
import { useAuth } from "../../context/authContext"; // Import your AuthContext
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const Chat = ({ selectedChat }) => {
  const { dbUser } = useAuth(); // Access dbUser from AuthContext
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (dbUser && selectedChat) {
      // Query to get messages between current user and selected chat user
      const q1 = query(
        collection(db, "messages"),
        where("from", "==", dbUser.email),
        where("to", "==", selectedChat.email),
        orderBy("timestamp")
      );

      const q2 = query(
        collection(db, "messages"),
        where("from", "==", selectedChat.email),
        where("to", "==", dbUser.email),
        orderBy("timestamp")
      );

      // Snapshot listeners for real-time updates for both queries
      const unsubscribe1 = onSnapshot(q1, (snapshot) => {
        const sentMessages = snapshot.docs.map((doc) => doc.data());
        setMessages((prev) => [...prev, ...sentMessages]);
      });

      const unsubscribe2 = onSnapshot(q2, (snapshot) => {
        const receivedMessages = snapshot.docs.map((doc) => doc.data());
        setMessages((prev) => [...prev, ...receivedMessages]);
      });

      // Cleanup listeners on component unmount or if selectedChat changes
      return () => {
        unsubscribe1();
        unsubscribe2();
      };
    }
  }, [dbUser, selectedChat]);

  // Function to send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return; // Avoid sending empty messages

    await addDoc(collection(db, "messages"), {
      from: dbUser.email,
      to: selectedChat.email,
      text: message,
      timestamp: serverTimestamp(),
    });

    setMessage(""); // Clear input after sending
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages
          .sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds)
          .map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.from === dbUser.email ? "sent" : "received"
              }`}
            >
              <p>{msg.text}</p>
              <span className="timestamp">
                {msg.timestamp?.toDate().toLocaleString()}
              </span>
            </div>
          ))}
      </div>
      <form onSubmit={sendMessage} className="input-container">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  chatInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  messageContainer: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  sent: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
  },
  received: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f0f0',
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginRight: 10,
  },
});


