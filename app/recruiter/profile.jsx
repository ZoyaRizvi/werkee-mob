import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Alert, ScrollView, FlatList, TextInput, Modal } from 'react-native';
import { Avatar, Button, Card, Title, Paragraph, IconButton } from 'react-native-paper';
import { auth, db, storage } from "../../firebase/firebase";
import { doc, getDoc, getDocs, collection, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Linking } from 'react-native';

const { width } = Dimensions.get('window');

const defaultProfile = {
  displayName: '',
  title: '',
  info: '',
  location: '',
  facebook: '',
  twitter: '',
  instagram: '',
  skills: [],
  coverPhoto: '',
  img: '',
  badge: '',
  work: [],
};

const Profile = () => {
  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [showFullInfo, setShowFullInfo] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    img: '',
    title: '',
    description: '',
    Requirements: '',
    experienceLevel: '',
    jobLocation: '',
    employmentType: 'Full-time',
    companyName: '',
    companyLogo: '',
    postedDate: ''
  });
  const [image, setImage] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editedProfile, setEditedProfile] = useState(defaultProfile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);


  const toggleInfoDisplay = () => setShowFullInfo((prev) => !prev);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert("Error", "User not logged in.");
          return;
        }
        const userId = user.uid;
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fetchedData = docSnap.data();
          setProfile({ ...defaultProfile, ...fetchedData, skills: fetchedData.skills || [], work: fetchedData.work || [] });
        } else {
          Alert.alert("Error", "User profile document not found.");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Error", "Could not fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchJobs();
  }, []);

  const handleEditProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const userId = user.uid;
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, editedProfile);
      setProfile(editedProfile);
      setIsEditModalOpen(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile.");
    }
  };

  const openEditModal = () => {
    setEditedProfile(profile);
    setIsEditModalOpen(true);
  };

  const handleEditJob = (job) => {
    setNewJob(job);
    setEditingJobId(job.id);
    setIsModalOpen(true);
  };

  const handleDeleteJob = async (id) => {
    const user = auth.currentUser;
    if (user) {
      Alert.alert(
        "Delete Job",
        "Are you sure you want to delete this job?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel pressed"),
            style: "cancel"
          },
          {
            text: "Delete",
            onPress: async () => {
              const jobRef = doc(db, "Candidate_Jobs", user.uid, "jobs", id); 
              await deleteDoc(jobRef);
              fetchJobs(); 
              Alert.alert("Success", "Job deleted successfully.");
            }
          }
        ],
        { cancelable: true }
      );
    }
  };
  

  const openDeleteModal = (job) => {
    setJobToDelete(job);
    setIsDeleteModalOpen(true);
  };

  const fetchJobs = async () => {
    const user = auth.currentUser;
    if (user) {
      const querySnapshot = await getDocs(collection(db, "Jobsposted", user.uid, "jobs"));
      const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsData);
    }
  };

  const handleModalOpen = () => {
    setNewProject({ title: "", description: "", img: "" }); // Reset the project form
    setIsModalOpen(true);
  };

  const handleAddOrUpdateJob = async () => {
    const user = auth.currentUser;
    if (user) {
      let imageUrl = newJob.img || '';
      if (image) {
        const storageRef = ref(storage, `jobs/${user.uid}/${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      let companyLogoUrl = '';
      if (companyLogo) {
        const storageRef = ref(storage, `jobs/${user.uid}/${companyLogo.name}`);
        await uploadBytes(storageRef, companyLogo);
        companyLogoUrl = await getDownloadURL(storageRef);
      }

      if (editingJobId) {
        const jobRef = doc(db, "Jobsposted", user.uid, "jobs", editingJobId);
        await updateDoc(jobRef, { ...newJob, img: imageUrl, companyLogo: companyLogoUrl });
      } else {
        await addDoc(collection(db, "Jobsposted", user.uid, "jobs"), { ...newJob, img: imageUrl, companyLogo: companyLogoUrl });
      }
      fetchJobs();
      setIsModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setImage(null);
    setCompanyLogo(null);
    setNewJob({
      img: '',
      title: '',
      description: '',
      Requirements: '',
      experienceLevel: '',
      jobLocation: '',
      employmentType: 'Full-time',
      companyName: '',
      companyLogo: '',
      postedDate: ''
    });
    setEditingJobId(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image
          source={{ uri: profile.coverPhoto || 'https://png.pngtree.com/illustrations/20190321/ourlarge/pngtree-letter-jobs-character-bookshelf-png-image_34014.jpg' }}
          style={styles.backgroundImage}
        />

        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar.Image
              size={80}
              source={{ uri: profile.img || 'https://example.com/avatar.jpg' }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Title style={styles.name}>{profile.displayName || 'Add Name'}</Title>
              <Text style={styles.role}>{profile.title || 'Add Title'}</Text>
            </View>
            <IconButton
              icon="pencil"
              size={24}
              onPress={openEditModal}
              style={styles.editButton}
            />
          </View>

          <Card.Content>
            <Paragraph style={styles.profileDescription}>
              {showFullInfo ? profile.info : profile.info.slice(0, 100) + (profile.info.length > 100 ? '...' : '')}
              {profile.info.length > 100 && (
                <Text style={styles.moreText} onPress={toggleInfoDisplay}>
                  {showFullInfo ? 'Show Less' : 'More'}
                </Text>
              )}
            </Paragraph>

            <View style={styles.additionalInfo}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoText}>{profile.location || "Add Location"}</Text>

              <Text style={styles.infoLabel}>Social:</Text>
              <View style={styles.socialIcons}>
                {profile.facebook && (
                  <IconButton
                    icon="facebook"
                    size={20}
                    onPress={() => Linking.openURL(profile.facebook)}
                  />
                )}
                {profile.twitter && (
                  <IconButton
                    icon="twitter"
                    size={20}
                    onPress={() => Linking.openURL(profile.twitter)}
                  />
                )}
                {profile.instagram && (
                  <IconButton
                    icon="instagram"
                    size={20}
                    onPress={() => Linking.openURL(profile.instagram)}
                  />
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        <Modal visible={isEditModalOpen} onRequestClose={() => setIsEditModalOpen(false)}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editedProfile.displayName}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, displayName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={editedProfile.title}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Info"
              value={editedProfile.info}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, info: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={editedProfile.location}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, location: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Facebook"
              value={editedProfile.facebook}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, facebook: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Twitter"
              value={editedProfile.twitter}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, twitter: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Instagram"
              value={editedProfile.instagram}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, instagram: text })}
            />
            <Button mode="contained" onPress={handleEditProfile}>
              Save Changes
            </Button>
          </View>
        </Modal>

        <View style={styles.jobsContainer}>
          <Button mode="contained" onPress={() => setIsModalOpen(true)} style={styles.addJobButton}>
            Add New Job
          </Button>

          {jobs.length === 0 ? (
            <Text>No jobs posted yet.</Text>
          ) : (
            <FlatList
              data={jobs}
              renderItem={({ item }) => (
                <Card key={item.id} style={styles.card}>
                  <Card.Content style={styles.cardContent}>

                    <Image source={{ uri: item.companyLogo }} style={styles.companyLogo} />

                    <Title style={styles.jobTitle}>{item.title}</Title>

                    <Paragraph style={styles.jobDescription}>{item.description}</Paragraph>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoText}>Requirements: {item.Requirements}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoText}>Experience Level: {item.experienceLevel}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoText}>Location: {item.jobLocation}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoText}>Employment Type: {item.employmentType}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoText}>Company: {item.companyName}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoText}>Posted Date: {new Date(item.postedDate).toLocaleDateString()}</Text>
                    </View>

                    <Button
                    mode="contained"
                    onPress={() => { setNewJob(item); setEditingJobId(item.id); setIsModalOpen(true); }}
                    style={styles.button}
                  >
                    Edit
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleDeleteJob(item.id)}
                    style={styles.button}
                  >
                    Delete
                  </Button>
                  </Card.Content>
                </Card>
              )}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>

        <Modal visible={isDeleteModalOpen} onRequestClose={() => setIsDeleteModalOpen(false)}>
          <View style={styles.modalContent}>
            <Text>Are you sure you want to delete this job?</Text>
            <Button onPress={handleDeleteJob}>Yes, Delete</Button>
            <Button onPress={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          </View>
        </Modal>

        <Modal visible={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Job Title"
              value={newJob.title}
              onChangeText={(text) => setNewJob({ ...newJob, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Company Name"
              value={newJob.companyName}
              onChangeText={(text) => setNewJob({ ...newJob, companyName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newJob.description}
              onChangeText={(text) => setNewJob({ ...newJob, description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Requirements"
              value={newJob.Requirements}
              onChangeText={(text) => setNewJob({ ...newJob, Requirements: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Experience Level"
              value={newJob.experienceLevel}
              onChangeText={(text) => setNewJob({ ...newJob, experienceLevel: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Job Location"
              value={newJob.jobLocation}
              onChangeText={(text) => setNewJob({ ...newJob, jobLocation: text })}
            />
            <Button onPress={handleAddOrUpdateJob}>Save Job</Button>
            <Button onPress={() => setIsModalOpen(false)}>Cancel</Button>
          </View>
        </Modal>

        <Modal visible={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Job Title"
              value={newJob.title}
              onChangeText={(text) => setNewJob({ ...newJob, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Company Name"
              value={newJob.companyName}
              onChangeText={(text) => setNewJob({ ...newJob, companyName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newJob.description}
              onChangeText={(text) => setNewJob({ ...newJob, description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Requirements"
              value={newJob.Requirements}
              onChangeText={(text) => setNewJob({ ...newJob, Requirements: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Experience Level"
              value={newJob.experienceLevel}
              onChangeText={(text) => setNewJob({ ...newJob, experienceLevel: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Job Location"
              value={newJob.jobLocation}
              onChangeText={(text) => setNewJob({ ...newJob, jobLocation: text })}
            />
            <Button onPress={handleAddOrUpdateJob}>Save Job</Button>
            <Button onPress={() => setIsModalOpen(false)}>Cancel</Button>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 50 },
  container: { flex: 1, alignItems: 'center' },
  backgroundImage: { width, height: width * 0.5, position: 'absolute', top: 0, opacity: 0.8 },
  profileCard: { marginTop: width * 0.3, width: '90%', borderRadius: 8, padding: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { marginRight: 20 },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  role: { fontSize: 14, color: 'gray' },
  editButton: { position: 'absolute', top: 10, right: 10 },
  profileDescription: { fontSize: 14, color: 'gray' },
  moreText: { color: 'blue', textDecorationLine: 'underline' },
  additionalInfo: { marginVertical: 10 },
  infoLabel: { fontWeight: 'bold' },
  infoText: { color: 'gray' },
  socialIcons: { flexDirection: 'row', marginVertical: 10 },
  jobsContainer: { marginTop: 20 },
  addJobButton: { marginBottom: 10 },
  jobCard: { marginBottom: 10, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8, elevation: 3 },
  modalContent: { padding: 20 },
  input: { marginBottom: 10, borderBottomWidth: 1, padding: 5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: 'gray' },
  jobActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 10 },
  jobActionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  editButtonIcon: {
    fontSize: 20,
    color: '#007bff',
    marginLeft: 10,
    padding: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContainer: { padding: 10 },
  container: { flex: 1 },
  backgroundImage: { width: width, height: 200, marginBottom: 20 },
  profileCard: { marginBottom: 20 },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { marginRight: 20 },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  role: { fontSize: 14, color: 'gray' },
  editButton: { position: 'absolute', top: 10, right: 10 },
  profileDescription: { fontSize: 14, color: 'gray' },
  moreText: { color: 'blue', textDecorationLine: 'underline' },
  additionalInfo: { marginVertical: 10 },
  infoLabel: { fontWeight: 'bold' },
  infoText: { color: 'gray' },
  socialIcons: { flexDirection: 'row', marginVertical: 10 },
  jobsContainer: { marginTop: 20 },
  addJobButton: { marginBottom: 10 },
  jobCard: { marginBottom: 10 },
  modalContent: { padding: 20 },
  input: { marginBottom: 10, borderBottomWidth: 1, padding: 5 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 0,
  },
});


export default Profile;
