import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Alert } from "react-native";
import { db } from "../../firebase/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons';

export function Freelancers() {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [newUser, setNewUser] = useState({ displayName: '', email: '', role: '' });
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "candidate"));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsersData(users);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  const handleOpenConfirmDialog = (userId) => {
    setUserToDelete(userId);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteDoc(doc(db, "users", userToDelete));
        setUsersData(usersData.filter(user => user.id !== userToDelete));
        handleCloseConfirmDialog();
      } catch (error) {
        console.error("Error deleting user: ", error);
      }
    }
  };

  const handleOpenAddUserDialog = () => {
    setOpenAddUserDialog(true);
  };

  const handleCloseAddUserDialog = () => {
    setOpenAddUserDialog(false);
    setNewUser({ displayName: '', email: '', role: '' });
  };

  const handleAddUser = async () => {
    try {
      await addDoc(collection(db, "users"), {
        ...newUser,
        img: '',
        createdAt: serverTimestamp(),
      });
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUserId);
      setUsersData(users);
      handleCloseAddUserDialog();
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text>{item.email}</Text>
        <Text>{item.role}</Text>
      </View>
      <TouchableOpacity onPress={() => handleOpenConfirmDialog(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Candidates</Text>
      <Text>Total: {usersData.length}</Text>

      <TouchableOpacity onPress={handleOpenAddUserDialog} style={styles.addUserButton}>
        <Text style={styles.addUserButtonText}>Add User</Text>
      </TouchableOpacity>

      <FlatList
        data={usersData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.userList}
      />

      {/* Add User Dialog */}
      <Modal visible={openAddUserDialog} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TextInput
              style={styles.input}
              placeholder="Display Name"
              value={newUser.displayName}
              onChangeText={(text) => setNewUser({ ...newUser, displayName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newUser.email}
              onChangeText={(text) => setNewUser({ ...newUser, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Role"
              value={newUser.role}
              onChangeText={(text) => setNewUser({ ...newUser, role: text })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={handleCloseAddUserDialog} style={styles.cancelButton}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddUser} style={styles.addButton}>
                <Text>Add User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Delete Dialog */}
      <Modal visible={openConfirmDialog} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text>Are you sure you want to delete this user?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={handleCloseConfirmDialog} style={styles.cancelButton}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmDelete} style={styles.deleteButton}>
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userList: {
    marginTop: 16,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  addUserButton: {
    marginTop: 16,
    backgroundColor: '#007bff',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  addUserButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  addButton: {
    padding: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'red',
    borderRadius: 4,
  },
});

export default Freelancers;
