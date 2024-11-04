import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Alert, ScrollView, FlatList, TextInput, Modal } from 'react-native';
import { Avatar, Button, Card, Title, Paragraph, Chip, IconButton } from 'react-native-paper';
import { auth, db, storage } from "../../firebase/firebase"; // Ensure Firebase storage is configured
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

  const fetchProjects = async () => {
    const user = auth.currentUser;
    if (user) {
      const querySnapshot = await getDocs(collection(db, "Candidate_Work", user.uid, "projects"));
      const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
    }
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
      if (editingProjectId) {
        const projectRef = doc(db, "Candidate_Work", user.uid, "projects", editingProjectId);
        await updateDoc(projectRef, { ...newProject, img: imageUrl });
      } else {
        await addDoc(collection(db, "Candidate_Work", user.uid, "projects"), { ...newProject, img: imageUrl });
      }
      fetchProjects();
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDeleteProject = async (id) => {
    const user = auth.currentUser;
    if (user) {
      const projectRef = doc(db, "Candidate_Work", user.uid, "projects", id);
      await deleteDoc(projectRef);
      fetchProjects();
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
        <Text>Loading profile...</Text>
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
              size={70}
              source={{ uri: profile.img || 'https://example.com/avatar.jpg' }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Title style={styles.name}>{profile.displayName || 'Add Name'}</Title>
              <Text style={styles.role}>{profile.title || 'Add Title'}</Text>
            </View>
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
            <View style={styles.actionButtons}>
              <Button mode="outlined" style={styles.button} onPress={() => { }}>
                Message
              </Button>
              <Button mode="outlined" style={styles.button} onPress={() => { }}>
                Skill Assessment
              </Button>
            </View>

            <View style={styles.additionalInfo}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoText}>{profile.location || "Add Location"}</Text>

              <Text style={styles.infoLabel}>Social:</Text>
              <View style={styles.socialIcons}>
                {profile.facebook && <IconButton icon="facebook" size={20} onPress={() => { }} />}
                {profile.twitter && <IconButton icon="twitter" size={20} onPress={() => { }} />}
                {profile.instagram && <IconButton icon="instagram" size={20} onPress={() => { }} />}
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

        <View style={styles.workSection}>
          <Text style={styles.workTitle}>My Work</Text>
          <Button mode="contained" onPress={() => setIsModalOpen(true)} style={styles.uploadButton}>Upload Your Work</Button>

          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.workCard}>
                <Image source={{ uri: item.img || 'default-image-url' }} style={styles.workImage} />
                <Text style={styles.workTitleText}>{item.title}</Text>
                <Text style={styles.workDescription}>{item.description}</Text>
                <View style={styles.buttonRow}>
                  <Button mode="contained" onPress={() => { setNewProject(item); setEditingProjectId(item.id); setIsModalOpen(true); }}>
                    Edit
                  </Button>
                  <Button mode="contained" onPress={() => handleDeleteProject(item.id)}>
                    Delete
                  </Button>
                </View>
              </View>
            )}
          />

          <Modal visible={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
            <View style={styles.modalContent}>
              <TextInput placeholder="Title" value={newProject.title} onChangeText={(text) => setNewProject({ ...newProject, title: text })} />
              <TextInput placeholder="Tag" value={newProject.tag} onChangeText={(text) => setNewProject({ ...newProject, tag: text })} />
              <TextInput placeholder="Description" value={newProject.description} onChangeText={(text) => setNewProject({ ...newProject, description: text })} />
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
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    container: {
      marginTop: 30,
      flex: 1,
      backgroundColor: '#f5f5f5',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: 10,
      backgroundColor: '#fff',
      elevation: 4,
      zIndex: 1,
    },
    menuIcon: {
      flex: 0.2,
    },
    profileIconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 0.6,
      justifyContent: 'center',
    },
    profileName: {
      marginLeft: 10,
      fontSize: 16,
      fontWeight: 'bold',
    },
    headerIcons: {
      flexDirection: 'row',
      flex: 0.2,
      justifyContent: 'flex-end',
    },
    breadcrumb: {
      width: '90%',
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    breadcrumbText: {
      color: '#000',
      fontSize: 14,
    },
    backgroundImage: {
      position: 'absolute',
      top: 80, // Adjust according to header height
      width: '100%',
      height: 200,
      zIndex: -1, // Ensure it is behind other components
      resizeMode: 'cover',
      position: 'absolute', // Make the image cover the whole screen
    },
    overlay: {
      ...StyleSheet.absoluteFillObject, // Make the overlay cover the entire screen
      backgroundColor: 'rgba(0, 0, 0, 0.9)', // Semi-transparent black (adjust opacity to make it darker)
    },
    profileCard: {
      marginTop: 100,
      width: '90%',
      borderRadius: 15,
      padding: 20,
      backgroundColor: '#fff',
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    avatar: {
      marginRight: 15,
    },
    profileInfo: {
      flex: 1,
    },
    name: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    role: {
      fontSize: 14,
      color: '#888',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    button: {
      flex: 0.48, // Ensure buttons take equal space
    },
    profileDescription: {
      fontSize: 14,
      color: '#555',
    },
    additionalInfo: {
      marginTop: 20,
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 10,
    },
    infoText: {
      fontSize: 14,
      color: '#555',
    },
    socialIcons: {
      flexDirection: 'row',
      marginTop: 5,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 5,
    },
    skillChip: {
      margin: 3,
    },
    badgeText: {
      fontSize: 20,
      marginTop: 5,
    },
    settingsIcon: {
      marginLeft: 'auto',
    },
    workSection: {
      width: '90%',
      marginTop: 20,
    },
    workTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    uploadButton: {
      marginBottom: 15,
      alignSelf: 'flex-start',
    },
    workCard: {
      borderRadius: 15,
    },
    workImage: {
      width: '100%',
      height: 150,
      borderRadius: 15,
    },
    workTitleText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    workDescription: {
      fontSize: 14,
      color: '#555',
    },
  });

  export default Profile;
