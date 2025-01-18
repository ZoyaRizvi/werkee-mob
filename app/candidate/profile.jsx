import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Alert, ScrollView, FlatList, TextInput, Modal, Linking } from 'react-native';
import { Avatar, Button, Card, Title, Paragraph, Chip, IconButton } from 'react-native-paper';
import { auth, db, storage } from "../../firebase/firebase";
import { doc, getDoc, getDocs, collection, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', tag: '', description: '', img: '' });
  const [image, setImage] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editedProfile, setEditedProfile] = useState(defaultProfile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    fetchProjects();
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

  const handleAddNewProject = async () => {
    const user = auth.currentUser;
    if (user && newProject.title && newProject.description) {
      try {
        const docRef = await addDoc(collection(db, "Candidate_Work", user.uid, "projects"), {
          ...newProject,
          userId: user.uid,
          createdAt: new Date(),
        });
        console.log("Project added with ID: ", docRef.id);
        fetchProjects();
        setNewProject({ title: "", description: "", img: "" }); // Reset the form
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error adding project: ", error);
      }
    } else {
      Alert.alert("Error", "Please fill in all required fields");
    }
  };

  const handleModalOpen = () => {
    setNewProject({ title: "", description: "", img: "" }); // Reset the project form
    setIsModalOpen(true);
  };

  const handleAddOrUpdateProject = async () => {
    const user = auth.currentUser;
    if (user) {
      let imageUrl = newProject.img || '';
      if (image) {
        const storageRef = ref(storage, `mywork/${user.uid}/${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }
      const userProfileRef = doc(db, 'users', user.uid);
      const userProfileDoc = await getDoc(userProfileRef);

      if (!userProfileDoc.exists()) {
        Alert.alert("Error", "User profile not found.");
        return;
      }

      const userProfile = userProfileDoc.data();
      const workData = {
        ...newProject,
        img: imageUrl,
        profile_pic: userProfile.img || '',
        uid: user.uid,
        user_name: userProfile.displayName || 'Unknown User',
      };

      if (editingProjectId) {
        const projectRef = doc(db, "Candidate_Work", user.uid, "projects", editingProjectId);
        await updateDoc(projectRef, workData);
      } else {
        await addDoc(collection(db, "Candidate_Work", user.uid, "projects"), workData);
      }

      fetchProjects();
      setIsModalOpen(false);
      resetForm();
    }
  };


  const fetchProjects = async () => {
    const user = auth.currentUser;
    if (user) {
      const querySnapshot = await getDocs(collection(db, "Candidate_Work", user.uid, "projects"));
      const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
    }
  };

  const handleDeleteProject = async (id) => {
    const user = auth.currentUser;
    if (user) {
      Alert.alert(
        "Delete Project",
        "Are you sure you want to delete this project?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel pressed"),
            style: "cancel"
          },
          {
            text: "Delete",
            onPress: async () => {
              const projectRef = doc(db, "Candidate_Work", user.uid, "projects", id);
              await deleteDoc(projectRef);
              fetchProjects();
              Alert.alert("Success", "Project deleted successfully.");
            }
          }
        ],
        { cancelable: true }
      );
    }
  };

  const resetForm = () => {
    setImage(null);
    setNewProject({ title: '', tag: '', description: '', img: '' });
    setEditingProjectId(null);
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

              <Text style={styles.infoLabel}>Skills:</Text>
              <View style={styles.skillsContainer}>
                {profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <Chip key={index} style={styles.skillChip}>{skill}</Chip>
                  ))
                ) : (
                  <Text style={styles.noSkillsText}>Please add your skills here</Text>
                )}
              </View>

              <Text style={styles.infoLabel}>Badge:</Text>
              <Text style={styles.badgeText}>{profile.badge || "🏆"}</Text>
            </View>
          </Card.Content>
        </Card>

        <Modal visible={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newProject.title}
              onChangeText={(text) => setNewProject({ ...newProject, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Tag (e.g., #Cards #Illustrator)"
              value={newProject.tag}
              onChangeText={(text) => setNewProject({ ...newProject, tag: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newProject.description}
              onChangeText={(text) => setNewProject({ ...newProject, description: text })}
            />
            <Button mode="contained" onPress={handleAddOrUpdateProject}>
              Save Work
            </Button>
          </View>
        </Modal>


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
            <TextInput
              style={styles.input}
              placeholder="Skills"
              value={editedProfile.skills}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, skills: text })}
            />
            <Button mode="contained" onPress={handleEditProfile}>
              Save Changes
            </Button>
          </View>
        </Modal>

        <View style={styles.workSection}>
          <Text style={styles.workTitle}>My Work</Text>
          <Button
            mode="contained"
            onPress={handleModalOpen} 
            style={styles.button}
          >
            Upload Your Work
          </Button>

          <Modal visible={isModalOpen} onDismiss={() => setIsModalOpen(false)}>
            <View style={styles.modalContent}>
              <TextInput
                label="Title"
                value={newProject.title}
                onChangeText={(text) => setNewProject({ ...newProject, title: text })}
              />
              <TextInput
                label="Description"
                value={newProject.description}
                onChangeText={(text) => setNewProject({ ...newProject, description: text })}
              />
              <Button mode="contained" onPress={handleAddNewProject}>
                Add Project
              </Button>
            </View>
          </Modal>

          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.workCard}>
                <Image source={{ uri: item.img || 'default-image-url' }} style={styles.workImage} />
                <Text style={styles.workTitleText}>{item.title}</Text>
                <Text style={styles.workDescription}>{item.description}</Text>
                <View style={styles.buttonRow}>
                  <Button
                    mode="contained"
                    onPress={() => { setNewProject(item); setEditingProjectId(item.id); setIsModalOpen(true); }}
                    style={styles.button}
                  >
                    Edit
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleDeleteProject(item.id)}
                    style={styles.button}
                  >
                    Delete
                  </Button>
                </View>
              </View>
            )}
          />

          <Modal visible={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
            <View style={styles.modalContent}>
              <TextInput style={styles.input} placeholder="Title" value={newProject.title} onChangeText={(text) => setNewProject({ ...newProject, title: text })} />
              <TextInput style={styles.input} placeholder="Tag" value={newProject.tag} onChangeText={(text) => setNewProject({ ...newProject, tag: text })} />
              <TextInput style={styles.input} placeholder="Description" value={newProject.description} onChangeText={(text) => setNewProject({ ...newProject, description: text })} />
              <Button mode="contained" onPress={handleAddOrUpdateProject}>
                {editingProjectId ? 'Update Project' : 'Add Project'}
              </Button>
            </View>
          </Modal>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 50 },
  container: { flex: 1, alignItems: 'center' },
  backgroundImage: { width, height: width * 0.5, position: 'absolute', top: 0, opacity: 0.8 },
  profileCard: { marginTop: width * 0.3, width: '90%', borderRadius: 8, padding: 16 , backgroundColor: '#D3D3D3' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { backgroundColor: 'white' },
  profileInfo: { marginLeft: 16 },
  name: { fontSize: 24, fontWeight: 'bold' },
  role: { fontSize: 16, color: 'gray' },
  profileDescription: { marginVertical: 12, color: 'darkgray', lineHeight: 22 },
  moreText: { color: 'blue', marginTop: 8 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
  button: { flex: 1, marginHorizontal: 4 },
  additionalInfo: { marginTop: 12 },
  infoLabel: { fontWeight: '600', marginTop: 8 },
  infoText: { color: 'gray', fontSize: 14 },
  socialIcons: { flexDirection: 'row' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  skillChip: { marginRight: 6, marginTop: 4 },
  noSkillsText: { color: 'gray' },
  badgeText: { fontSize: 18 },
  workSection: { width: '90%', marginTop: 16 },
  workTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  uploadButton: { alignSelf: 'center', marginVertical: 12 },
  workCard: { marginBottom: 12, padding: 10, borderColor: 'lightgray', borderWidth: 1, borderRadius: 8 },
  workImage: { width: '100%', height: 120, borderRadius: 8, marginBottom: 8 },
  workTitleText: { fontWeight: '600', fontSize: 16 },
  workDescription: { color: 'gray', marginTop: 4 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalContent: { padding: 20, backgroundColor: 'white', margin: 20, borderRadius: 8 },
  input: { marginBottom: 12, backgroundColor: 'white', borderColor: 'gray', borderWidth: 1, paddingHorizontal: 8, borderRadius: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: 'gray' },
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