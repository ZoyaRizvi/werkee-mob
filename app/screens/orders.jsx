import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Avatar, Button, Card, Divider, Icon } from '@rneui/themed';
import { query, where, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';

const DEFAULT_PROFILE_IMAGE = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUFJ4m3HGM8397IWhGhLphaU38QtqrcYQoUg&s';

export default function OrdersScreen() {
  const [ordersData, setOrdersData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const ordersPerPage = 5;

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not logged in');
        return;
      }
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('FreelancerEmail', '==', user.email));
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrdersData(orders);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (newStatus, orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      Alert.alert('Success', 'Order status updated.');
      fetchOrders();
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = ordersData.slice(indexOfFirstOrder, indexOfLastOrder);

  const renderOrder = ({ item }) => (
    <Card containerStyle={styles.card}>
      <View style={styles.orderHeader}>
        <Avatar
          source={{ uri: item.img || DEFAULT_PROFILE_IMAGE }}
          size={50}
          rounded
          containerStyle={{ marginRight: 15 }}
        />
        <View>
          <Text style={styles.orderTitle}>{item.title}</Text>
          <Text style={styles.orderSubText}>
            Order No: {item.orderNumber}
          </Text>
        </View>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.orderDetails}>
        <Text style={styles.detailText}>Recruiter: {item.RecruiterEmail || item.customer}</Text>
        <Text style={styles.detailText}>Price: ${item.price}</Text>
        <Text style={styles.detailText}>
          Date: {new Date(item.timestamp.seconds * 1000).toLocaleDateString()}
        </Text>
        <Text style={[styles.detailText, styles.statusText(item.status)]}>
          Status: {item.status}
        </Text>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => handleStatusChange('Delivered', item.id)}
        >
          <Icon name="check-circle" type="material" color="white" size={20} />
          <Text style={styles.actionText}>Delivered</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
          onPress={() => handleStatusChange('Cancelled', item.id)}
        >
          <Icon name="cancel" type="material" color="white" size={20} />
          <Text style={styles.actionText}>Cancelled</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Orders</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <FlatList
          data={currentOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
        />
      )}
      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.disabledButton,
          ]}
        >
          <Text style={styles.paginationText}>Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            setCurrentPage((prev) =>
              indexOfLastOrder >= ordersData.length ? prev : prev + 1
            )
          }
          disabled={indexOfLastOrder >= ordersData.length}
          style={[
            styles.paginationButton,
            indexOfLastOrder >= ordersData.length && styles.disabledButton,
          ]}
        >
          <Text style={styles.paginationText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
  },
  orderSubText: {
    fontSize: 14,
    color: '#777',
  },
  divider: {
    marginVertical: 10,
  },
  orderDetails: {
    marginVertical: 10,
  },
  detailText: {
    fontSize: 14,
    marginVertical: 3,
    color: '#555',
  },
  statusText: (status) => ({
    color:
      status === 'Pending' ? '#FFC107' : status === 'Delivered' ? '#4CAF50' : '#F44336',
    fontWeight: 'bold',
  }),
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    width: '48%',
  },
  actionText: {
    color: '#FFFFFF',
    marginLeft: 5,
    fontSize: 14,
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  paginationButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
  },
  paginationText: {
    color: '#FFF',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
});
