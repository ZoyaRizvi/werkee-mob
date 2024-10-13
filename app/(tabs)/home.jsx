import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import CustomButton from '../../components/CustomButton';

const jobsMockData = [
  {
    id: 1,
    title: 'Software Engineer',
    company: 'Amazon',
    requirements: 'Selenium',
    location: 'Karachi',
    contractType: 'Contract',
    postingDate: '8/3/2024',
    imageUrl: 'https://via.placeholder.com/60',
    description: 'This project involved creating a comprehensive branding and visual identity package for Amazon.',
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'Amazon',
    requirements: 'Selenium',
    location: 'Karachi',
    contractType: 'Contract',
    postingDate: '8/3/2024',
    imageUrl: 'https://via.placeholder.com/60',
    description: 'The goal was to develop a modern, cohesive, and visually striking brand identity for Amazon.',
  },
  {
    id: 3,
    title: 'Data Scientist',
    company: 'Amazon',
    requirements: 'Selenium',
    location: 'Karachi',
    contractType: 'Contract',
    postingDate: '8/3/2024',
    imageUrl: 'https://via.placeholder.com/60',
    description: 'Comprehensive branding and visual identity project for Amazon.',
  },
  {
    id: 4,
    title: 'Data Analyst',
    company: 'Amazon',
    requirements: 'Selenium',
    location: 'Karachi',
    contractType: 'Contract',
    postingDate: '8/3/2024',
    imageUrl: 'https://via.placeholder.com/60',
    description: 'Visual identity package for Amazon, focusing on modern and cohesive branding.',
  },
];

const Home = () => {
  const [query, setQuery] = useState('');

  const handleInputChange = (text) => {
    setQuery(text);
  };

  const handleSearch = () => {
    alert(`Searching for projects with: ${query}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Banner Section */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Find your <Text style={{ color: '#51834f' }}>new project</Text> today
          </Text>
          <Text style={styles.bannerSubText}>
            Endless opportunities are just around the corner—dive in and grab yours.
          </Text>

          {/* Search Section */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="What projects are you looking for?"
              placeholderTextColor="#999"
              value={query}
              onChangeText={handleInputChange}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Job Listings Section */}
        <View style={styles.card}>
          {jobsMockData.map((job) => (
            <View key={job.id} style={styles.jobItem}>
              <Image source={{ uri: job.imageUrl }} style={styles.jobImage} />
              <View style={styles.jobDetailsContainer}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobCompany}>{job.company}</Text>
                <Text style={styles.jobExtraDetails}>Requirements: {job.requirements}</Text>
                <Text style={styles.jobExtraDetails}>Location: {job.location}</Text>
                <Text style={styles.jobExtraDetails}>Contract Type: {job.contractType}</Text>
                <Text style={styles.jobExtraDetails}>Posted on: {job.postingDate}</Text>
                <Text style={styles.jobDescription}>{job.description}</Text>
                {/* Apply Button */}
                <CustomButton
                  title="Apply"
                  handlePress={() => alert(`Applying for ${job.title}`)}
                  containerStyles={styles.applyButtonContainer}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  bannerSubText: {
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 32,
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
  searchButton: {
    backgroundColor: '#009B81',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  searchButtonText: {
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
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  jobDetailsContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobCompany: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 4,
  },
  jobExtraDetails: {
    fontSize: 12,
    color: '#718096',
  },
  jobDescription: {
    fontSize: 12,
    color: '#4a5568',
    marginVertical: 4,
  },
  applyButtonContainer: {
    marginTop: 10,
    paddingVertical: 6, // Smaller padding for a smaller button
    paddingHorizontal: 12,
    alignSelf: 'flex-end', // Right-align the button
    backgroundColor: '#009B81',
    borderRadius: 8,
  },
});

export default Home;
