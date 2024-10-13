// Chat.js
import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const chatData = [
  {
    id: '1',
    name: 'John Doe',
    message: 'Hey! How are you?',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Jane Smith',
    message: 'Let’s catch up later!',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    message: 'Are we still meeting at 3 PM?',
    image: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
  {
    id: '4',
    name: 'Emily Davis',
    message: 'Sure! See you soon!',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

const Chat = () => {
  const navigation = useNavigation(); // Navigation hook

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      onPress={() => navigation.navigate('Message', { name: item.name })}
    >
      <Image source={{ uri: item.image }} style={styles.profileImage} />
      <View style={styles.chatInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chatData}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default Chat;
