import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet 
} from 'react-native';

const Message = ({ route }) => {
  const { name } = route.params; // Get the chat name from route params
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      const newMessage = { id: Date.now().toString(), text: input, sender: 'You' };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  const renderMessage = ({ item }) => (
    <View 
      style={[styles.messageContainer, 
        item.sender === 'You' ? styles.sentMessage : styles.receivedMessage
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.chatHeader}>Chat with {name}</Text>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 15,
    textAlign: 'center',
    backgroundColor: '#037c6e',
    color: '#fff',
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: '75%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0084ff',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ddd',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15, // Increased vertical padding for height
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#037c6e',
    borderRadius: 25,
    paddingHorizontal: 25,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Message;
