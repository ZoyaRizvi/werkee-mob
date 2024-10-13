import React from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window'); // Get screen width

const Councellor = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header with back button, profile image and icons */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" style={styles.backButton} />
        </TouchableOpacity>
        
        <View style={styles.profileInfo}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/women/1.jpg' }} 
            style={styles.profileImage} 
          />
          <Text style={styles.userName}>Dalen Haywood</Text>
        </View>
        <View style={styles.icons}>
          <Icon name="bell" size={24} color="#666" style={styles.icon} />
          <Icon name="gear" size={24} color="#666" style={styles.icon} />
        </View>
      </View>

      {/* Message container */}
      <View style={styles.messageContainer}>
        {/* User message */}
        <View style={styles.userMessage}>
          <Text style={styles.userMessageText}>HI</Text>
        </View>

        {/* Bot message */}
        <View style={styles.botMessageContainer}>
          <Image 
            source={{ uri: 'https://www.shutterstock.com/image-vector/3d-vector-robot-chatbot-ai-260nw-2294117979.jpg' }} 
            style={styles.botImage} 
          />
          <View style={styles.botMessage}>
            <Text style={styles.botMessageText}>
              Hi there! 👋 Welcome to Werky! 😊 I'm your friendly career counseling bot. 
              Tell me, what are you interested in? What kind of work do you see yourself doing? 🤔 
              And what's your age range? Knowing these things will help me recommend the best freelancing opportunities and tools for you. 😁
            </Text>
          </View>
        </View>
      </View>

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Type your message..." 
        />
        <TouchableOpacity style={styles.sendButton}>
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
    alignSelf: 'flex-end', // Align user message to the right
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
    borderRadius:20,
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

