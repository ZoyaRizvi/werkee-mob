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
} from 'react-native';
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
  const [formData, setFormData] = useState({ name: '', resume: null, coverLetter: '' });
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

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

  const handleFileChange = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Accept all file types
        copyToCacheDirectory: true,
      });
  
      console.log("Document Picker Result:", result);
  
      if (result.canceled === false && result.assets?.[0]?.uri) {
        const selectedFile = result.assets[0];
        setFormData((prevData) => ({ ...prevData, resume: selectedFile }));
        console.log("File successfully selected:", selectedFile);
      } else {
        Alert.alert("File selection was canceled or invalid.");
      }
    } catch (err) {
      console.error("Error picking file:", err);
      Alert.alert("An error occurred while picking the file.");
    }
  };  

  const handleSubmit = async () => {
    if (!formData.name || !formData.coverLetter || !formData.resume?.uri) {
      Alert.alert("All fields are required, and resume must be selected!");
      return;
    }
  
    try {
      // Fetch the file as a blob
      const response = await fetch(formData.resume.uri);
      const blob = await response.blob();
  
      const resumeRef = ref(storage, `resumes/${formData.resume.name}`);
      await uploadBytes(resumeRef, blob);
  
      const resumeUrl = await getDownloadURL(resumeRef);
  
      await addDoc(collection(db, "applications"), {
        ...formData,
        email: currentUserEmail,
        resume: resumeUrl,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        timestamp: new Date(),
      });
  
      Alert.alert("Application submitted successfully");
      setIsModalOpen(false);
      setFormData({ name: '', resume: null, coverLetter: '' });
    } catch (e) {
      console.error("Error uploading document:", e);
      Alert.alert("Error submitting application");
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Apply for {selectedJob?.title}</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Cover Letter"
              value={formData.coverLetter}
              onChangeText={(text) => handleInputChange('coverLetter', text)}
            />
            <Button title="Select Resume" onPress={handleFileChange} />
            <View style={styles.buttonContainer}>
              <Button title="Submit" onPress={handleSubmit} color="#009B81" />
              <Button title="Cancel" onPress={() => setIsModalOpen(false)} color="#ff0000" />
            </View>
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
          title="Apply"
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
