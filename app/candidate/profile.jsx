import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Avatar, Button, Card, Title, Paragraph, IconButton, Chip } from 'react-native-paper';

const { width } = Dimensions.get('window'); // Get screen width for dynamic sizing

const Profile = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>


        {/* Breadcrumb Section */}
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>Dashboard</Text>
          <Text style={styles.breadcrumbText}> / Profile</Text>
        </View>

        {/* Background image */}
        <Image source={{ uri: 'https://png.pngtree.com/illustrations/20190321/ourlarge/pngtree-letter-jobs-character-bookshelf-png-image_34014.jpg' }} style={styles.backgroundImage} />

        {/* Profile card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar.Image 
              size={70} 
              source={{ uri: 'https://example.com/avatar.jpg' }} 
              style={styles.avatar} 
            />
            <View style={styles.profileInfo}>
              <Title style={styles.name}>Dalen Haywood</Title>
              <Text style={styles.role}>Developer</Text>
            </View>
          </View>

          <Card.Content>
            <View style={styles.actionButtons}>
              <Button mode="outlined" style={styles.button} onPress={() => {}}>
                Message
              </Button>
              <Button mode="outlined" style={styles.button} onPress={() => {}}>
                Skill Assessment
              </Button>
            </View>

            <Paragraph style={styles.profileDescription}>
              Dalen is a Senior Software Engineer at Tech Innovations, specializing in full-stack development and cloud computing. 
              With over 10 years of experience in the tech industry, Dalen has contributed to multiple high-impact projects.
            </Paragraph>

            {/* Additional Information */}
            <View style={styles.additionalInfo}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoText}>Karachi</Text>

              <Text style={styles.infoLabel}>Social:</Text>
              <View style={styles.socialIcons}>
                <IconButton icon="facebook" size={20} onPress={() => {}} />
                <IconButton icon="twitter" size={20} onPress={() => {}} />
                <IconButton icon="instagram" size={20} onPress={() => {}} />
              </View>

              <Text style={styles.infoLabel}>Skills:</Text>
              <View style={styles.skillsContainer}>
                <Chip style={styles.skillChip}>SQA</Chip>
                <Chip style={styles.skillChip}>Marketing</Chip>
                <Chip style={styles.skillChip}>Technical Writing</Chip>
                <Chip style={styles.skillChip}>Voice Over</Chip>
                <Chip style={styles.skillChip}>Designing</Chip>
                <Chip style={styles.skillChip}>Web Development</Chip>
              </View>

              <Text style={styles.infoLabel}>Badge:</Text>
              <Text style={styles.badgeText}>🏆 🏆</Text>
            </View>
          </Card.Content>

        </Card>

        {/* Work Section */}
        <View style={styles.workSection}>
          <Text style={styles.workTitle}>My Work</Text>
          <Button mode="contained" style={styles.uploadButton} onPress={() => {}}>
            Upload Your Work
          </Button>

          {/* Work Card */}
          <Card style={styles.workCard}>
            <Image 
              source={{ uri: 'https://as1.ftcdn.net/v2/jpg/02/51/43/96/1000_F_251439633_Q40Ba5mfzIyyWizp4MJN5kEnIwOYQQpg.jpg' }} 
              style={styles.workImage} 
            />
            <Card.Content>
              <Title style={styles.workTitleText}>My Design</Title>
              <Paragraph style={styles.workDescription}>
                #lovewhatido #fun #passion 
                This project involved creating a comprehensive branding and visual identity package for [Client's Name/Company]. 
                The goal was to develop a modern, cohesive, and visually striking brand identity.
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <IconButton icon="cog" size={20} onPress={() => {}} />
            </Card.Actions>
          </Card>
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
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
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
    top: 60, // Adjust according to header height
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

