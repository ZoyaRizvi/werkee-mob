import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const { width } = Dimensions.get('window'); // Get screen width

const Councellor = ({ navigation }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false); // Track if conversation has started

  // Helper function to construct conversation history as a string
  const getConversationHistory = () => {
    return messages
      .map((msg) => (msg.sender === 'user' ? `User: ${msg.text}` : `Bot: ${msg.text}`))
      .join('\n');
  };

  async function generateAnswer() {
    if (!question.trim()) return;

    // Add the user's message to the chat history
    const newMessages = [...messages, { sender: 'user', text: question }];
    setMessages(newMessages);
    setQuestion(''); // Clear the input

    setGeneratingAnswer(true);

    // Construct the full conversation prompt
    let fullPrompt = getConversationHistory() + '\nUser: ' + question;

    // If it's the first message, include the predefined prompt
    if (!conversationStarted) {
      const initialPrompt =
        "You are a career counseling bot for a freelancing platform named Werky. Guide users based on their age and interests, and suggest them latest tools and technologies which are in trend nowadays for making money. Keep track of the conversation context and provide meaningful responses.";
      fullPrompt = `${initialPrompt}\n\n${fullPrompt}`;
      setConversationStarted(true); // Mark the conversation as started
    }

    try {
      const response = await axios({
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAV4yuWVHXVL-6JSG23G7tWPYPxYuDNx_0', // Replace with your actual API key
        method: 'post',
        data: {
          contents: [{ parts: [{ text: fullPrompt }] }],
        },
      });

      const botResponse = response.data.candidates[0].content.parts[0].text;

      // Add the bot's response to the chat history
      setMessages([...newMessages, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.log(error);
      setMessages([...newMessages, { sender: 'bot', text: 'Sorry - Something went wrong. Please try again!' }]);
    }

    setGeneratingAnswer(false);
  }

  return (
    <View style={styles.container}>

      {/* Message container */}
      <ScrollView style={styles.messageContainer}>
        {/* Loop through all messages */}
        {messages.map((msg, index) => (
          <View key={index} style={msg.sender === 'user' ? styles.userMessage : styles.botMessageContainer}>
            {msg.sender === 'bot' && (
              <Image
                source={{ uri: 'https://www.shutterstock.com/image-vector/3d-vector-robot-chatbot-ai-260nw-2294117979.jpg' }}
                style={styles.botImage}
              />
            )}
            <View style={msg.sender === 'user' ? styles.userMessage : styles.botMessage}>
              <Text style={msg.sender === 'user' ? styles.userMessageText : styles.botMessageText}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={question}
          onChangeText={setQuestion}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={generateAnswer}
          disabled={generatingAnswer}
        >
          <Icon name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  icons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 15,
  },
  messageContainer: {
    flex: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dceffc',
    padding: 10,
    borderRadius: 20,
    maxWidth: '80%',
    marginBottom: 10,
  },
  userMessageText: {
    fontSize: 16,
    color: '#000',
  },
  botMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  botImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  botMessage: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 15,
    maxWidth: '80%',
    flex: 1,
  },
  botMessageText: {
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 20,
  },
});

export default Councellor;


