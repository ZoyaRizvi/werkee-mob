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
  TouchableOpacity,
  Button,
} from 'react-native';
import { collection, collectionGroup, getDocs, addDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { db, storage, auth } from "../../firebase/firebase";
import CustomButton from '../../components/CustomButton';

export function Home() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    // Placeholder for file selection logic
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.coverLetter || !formData.resume) {
      Alert.alert("All fields are required!");
      return;
    }

    try {
      const resumeRef = ref(storage, `resumes/${formData.resume.name}`);
      await uploadBytes(resumeRef, formData.resume);
      const resumeUrl = await getDownloadURL(resumeRef);

      const recruiterDocRef = doc(db, 'JobResponses', selectedJob.recruiter_id);
      const applicationsCollectionRef = collection(recruiterDocRef, 'applications');

      await addDoc(applicationsCollectionRef, {
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
      console.error("Error adding document: ", e);
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
          <Text style={styles.bannerText}>
            Post a <Text style={{ color: '#51834f' }}>new project</Text> today
          </Text>
          <Text style={styles.bannerSubText}>
            Endless opportunities are just around the corner—dive in and grab yours.
          </Text>
          <TouchableOpacity
            style={styles.postButton}
            onPress={() => setIsModalOpen(true)}
          >
            <Text style={styles.postButtonText}>Post a Project</Text>
          </TouchableOpacity>
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
              placeholder="Your Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />

            <TextInput
              style={[styles.input, styles.coverLetterInput]}
              placeholder="Cover Letter"
              value={formData.coverLetter}
              onChangeText={(text) => handleInputChange('coverLetter', text)}
              multiline={true}
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.fileUploadButton} onPress={handleFileChange}>
              <Text style={styles.fileUploadButtonText}>
                {formData.resume ? `Selected: ${formData.resume.name}` : "Upload Resume"}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={[styles.actionButton, styles.submitButton]} onPress={handleSubmit}>
                <Text style={styles.actionButtonText}>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => setIsModalOpen(false)}>
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
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
  postButton: {
    backgroundColor: '#009B81',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  coverLetterInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  fileUploadButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#009B81',
    marginVertical: 12,
    alignItems: 'center',
  },
  fileUploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  submitButton: {
    backgroundColor: '#009B81',
  },
  cancelButton: {
    backgroundColor: '#ff4d4d',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Home;
