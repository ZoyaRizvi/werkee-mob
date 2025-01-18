import { db } from "../../firebase/firebase";
import { collection, query, where, getDocs,collectionGroup, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";


export function Recruiters() {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [newUser, setNewUser] = useState({ displayName: '', email: '', role: '' });
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));

  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "recruiter")
        );

        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsersData(users);

        // Process data for the chart
        const months = Array(12).fill(0);
        users.forEach((user) => {
          if (user.createdAt) {
            const registrationDate = user.createdAt.toDate();
            const month = registrationDate.getMonth();
            months[month]++;
          }
        });

        setMonthlyData(months);
      } catch (error) {
        console.error("Error fetching recruiter: ", error);
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
        .filter(user => user.id !== currentUserId); // Exclude the logged-in user
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
        <Ionicons name="trash-outline" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recruiters</Text>
      <Text>Total: {usersData.length}</Text>

      <TouchableOpacity onPress={handleOpenAddUserDialog} style={styles.addUserButton}>
        <Text style={styles.addUserButtonText}>Add Recruiters</Text>
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
                <Text>Add Recruiter</Text>
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
    backgroundColor: '#F4F5F7',
    padding: 16,
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  usersContainer: {
    flex: 1,
    justifyContent: 'center', // Centering the users container
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%', // To allow scrolling
    maxWidth: 600, // Limit max width for larger screens
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  scrollView: {
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  userDetails: {
    flex: 1,
  },
  userText: {
    fontSize: 14,
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#FF4D4D',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#D1D5DB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Recruiters;
