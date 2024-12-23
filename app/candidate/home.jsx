import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Button,
  TouchableOpacity ,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // for icons
import * as DocumentPicker from 'expo-document-picker';
import {
  collection,
  collectionGroup,
  getDocs,
  addDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { db, storage, auth } from "../../firebase/firebase";
import CustomButton from '../../components/CustomButton';

export function Home() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    deliveryTime: '',
    revisions: '',
    price: '',
    service: '',
    description: '',
  });
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchPost = async () => {
    try {
      const querySnapshot = await getDocs(collectionGroup(db, "jobs"));
      const newData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setJobs(newData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching jobs: ", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPost();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleOfferSubmit = async () => {
    const newErrors = {};

    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
    if (!formData.deliveryTime) {
      newErrors.deliveryTime = 'Delivery time is required';
    }
    if (!formData.revisions) {
      newErrors.revisions = 'Revisions are required';
    }
    if (!formData.price) {
      newErrors.price = 'Price is required';
    }
    if (!formData.service) {
      newErrors.service = 'Service is required';
    }
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const orderNumber = Math.floor(100000 + Math.random() * 90000);
    const offerId = `offer_${orderNumber}`;

    try {
      const offerData = {
        title: formData.title,
        deliveryTime: formData.deliveryTime,
        revisions: formData.revisions,
        price: formData.price,
        service: formData.service,
        description: formData.description,
        RecruiterEmail: recruiter_email,
        FreelancerEmail: currentUserEmail,
        timestamp: new Date(),
        orderNumber: offerId,
        status: 'Pending',
      };

      const offersCollectionRef = doc(db, "Offers", offerId);
      await setDoc(offersCollectionRef, offerData);

      console.log('Offer submitted successfully');
      setIsModalOpen(false);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const filteredData = jobs.map((data, i) => (
    <CardCustom key={i} data={data} openApplyModal={openApplyModal} />
  ));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Find your <Text style={{ color: '#51834f' }}>new job</Text> today</Text>
          <Text style={styles.bannerSubText}>Endless opportunities are just around the corner—dive in and grab yours.</Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="What jobs are you looking for?"
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#51834f" />
        ) : (
          <View style={styles.card}>
            {filteredData}
          </View>
        )}
      </ScrollView>

      <Modal visible={isModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make an Offer</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={formData.title}
                onChangeText={(text) => handleInputChange({ target: { name: 'title', value: text } })}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

              <TextInput
                style={styles.input}
                placeholder="Delivery Time (Days)"
                keyboardType="numeric"
                value={formData.deliveryTime}
                onChangeText={(text) => handleInputChange({ target: { name: 'deliveryTime', value: text } })}
              />
              {errors.deliveryTime && <Text style={styles.errorText}>{errors.deliveryTime}</Text>}

              <TextInput
                style={styles.input}
                placeholder="Revisions"
                keyboardType="numeric"
                value={formData.revisions}
                onChangeText={(text) => handleInputChange({ target: { name: 'revisions', value: text } })}
              />
              {errors.revisions && <Text style={styles.errorText}>{errors.revisions}</Text>}

              <TextInput
                style={styles.input}
                placeholder="Price"
                keyboardType="numeric"
                value={formData.price}
                onChangeText={(text) => handleInputChange({ target: { name: 'price', value: text } })}
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

              <TextInput
                style={styles.input}
                placeholder="Service"
                value={formData.service}
                onChangeText={(text) => handleInputChange({ target: { name: 'service', value: text } })}
              />
              {errors.service && <Text style={styles.errorText}>{errors.service}</Text>}

              <TextInput
                style={styles.input}
                placeholder="Description"
                multiline
                value={formData.description}
                onChangeText={(text) => handleInputChange({ target: { name: 'description', value: text } })}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

              <TouchableOpacity style={styles.submitButton} onPress={handleOfferSubmit}>
                <Text style={styles.submitButtonText}>Submit Offer</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const CardCustom = ({ data, openApplyModal }) => {
  const formattedDate = new Date(data.postedDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.jobItem}>
      <Image source={{ uri: data.companyLogo }} style={styles.jobImage} />
      <View style={styles.jobDetailsContainer}>
        <Text style={styles.jobTitle}>{data.title}</Text>
        <Text style={styles.jobCompany}>{data.companyName}</Text>
        <Text style={styles.jobExtraDetails}>Requirements: {data.Requirements}</Text>
        <Text style={styles.jobExtraDetails}>Location: {data.jobLocation}</Text>
        <Text style={styles.jobExtraDetails}>Contract Type: {data.employmentType}</Text>
        <Text style={styles.jobExtraDetails}>Posted on: {formattedDate}</Text>
        <Text style={styles.jobDescription}>{data.description}</Text>
        <CustomButton
          title="Make an Offer"
          handlePress={() => openApplyModal(data)}
          containerStyles={styles.applyButtonContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  banner: {
    backgroundColor: '#FFF2E1',
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 16,
    alignItems: 'center',
    padding: 16,
  },
  bannerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  bannerSubText: {
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 16,
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  jobItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 8,
  },
  jobImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  jobDetailsContainer: {
    flex: 1,
  },
  jobTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  jobCompany: {
    color: '#6b7280',
    marginBottom: 4,
  },
  jobExtraDetails: {
    color: '#9ca3af',
    marginBottom: 2,
  },
  jobDescription: {
    color: '#4b5563',
    marginBottom: 4,
  },
  applyButtonContainer: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#009B81',
    borderRadius: 8,
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
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});

export default Home;
